/**
 * Pure-JavaScript MD5 - RFC 1321.
 *
 * Used in environments without `node:crypto.createHash('md5')` (browser via
 * vite-plugin-node-polyfills, which externalizes `stream` and breaks the
 * polyfilled Hash.prototype._transform pipeline).
 *
 * This is NOT a cryptographic primitive - MD5 has known collision weaknesses.
 * We use it only to satisfy RFC 4122 UUID v3, which is itself deprecated.
 * Prefer UUID v5 (SHA-1) for new code.
 *
 * Implementation is the standard Merkle-Damgard construction with the four
 * auxiliary functions F/G/H/I and the 64-round constant table K.
 */

const K: Uint32Array = (() => {
  const t = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    t[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0;
  }
  return t;
})();

const S: readonly number[] = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

function rol(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

function add32(...xs: number[]): number {
  let acc = 0;
  for (const x of xs) acc = (acc + x) >>> 0;
  return acc;
}

export function md5(input: Uint8Array): Uint8Array {
  // Pre-processing: append 0x80, pad with zeros, then append bit length as LE u64.
  const bitLen = input.length * 8;
  const padLen = (((input.length + 8) >>> 6) + 1) << 6;
  const buf = new Uint8Array(padLen);
  buf.set(input);
  buf[input.length] = 0x80;
  // Encode bit length as little-endian 64-bit; we only support inputs up to 2^53 bytes.
  const lo = bitLen >>> 0;
  const hi = Math.floor(bitLen / 2 ** 32) >>> 0;
  const dv = new DataView(buf.buffer);
  dv.setUint32(padLen - 8, lo, true);
  dv.setUint32(padLen - 4, hi, true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  const M = new Uint32Array(16);
  for (let chunk = 0; chunk < padLen; chunk += 64) {
    for (let j = 0; j < 16; j++) M[j] = dv.getUint32(chunk + j * 4, true);

    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }

      const M_g = M[g] ?? 0;
      const temp = D;
      D = C;
      C = B;
      B = add32(B, rol(add32(A, F, M_g, K[i] ?? 0), S[i] ?? 0));
      A = temp;
    }

    a0 = add32(a0, A);
    b0 = add32(b0, B);
    c0 = add32(c0, C);
    d0 = add32(d0, D);
  }

  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0, true);
  ov.setUint32(4, b0, true);
  ov.setUint32(8, c0, true);
  ov.setUint32(12, d0, true);
  return out;
}