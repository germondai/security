import { Buffer } from 'node:buffer';

// --- Base32 (RFC 4648) ---
const B32_ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const B32_HEX_ALPH = '0123456789ABCDEFGHIJKLMNOPQRSTUV';

function b32encode(buf: Uint8Array, alph: string): string {
  let bits = 0, value = 0, out = '';
  for (let i = 0; i < buf.length; i++) {
    value = (value << 8) | (buf[i] ?? 0); bits += 8;
    while (bits >= 5) { out += alph[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += alph[(value << (5 - bits)) & 31];
  while (out.length % 8 !== 0) out += '=';
  return out;
}

function b32decode(s: string, alph: string): Uint8Array {
  const clean = s.replace(/=+$/g, '').toUpperCase();
  const lookup: Record<string, number> = {};
  for (let i = 0; i < alph.length; i++) lookup[alph[i] as string] = i;
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const v = lookup[ch];
    if (v === undefined) throw new Error(`invalid base32 character: ${ch}`);
    value = (value << 5) | v; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return new Uint8Array(out);
}

export function toBase32(b: Uint8Array): string   { return b32encode(b, B32_ALPH); }
export function fromBase32(s: string): Uint8Array { return b32decode(s, B32_ALPH); }
export function toBase32Hex(b: Uint8Array): string   { return b32encode(b, B32_HEX_ALPH); }
export function fromBase32Hex(s: string): Uint8Array { return b32decode(s, B32_HEX_ALPH); }

// --- Base58 (Bitcoin alphabet) ---
const B58_ALPH = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function b58encode(buf: Uint8Array): string {
  if (buf.length === 0) return '';
  let zeros = 0;
  while (zeros < buf.length && buf[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < buf.length; i++) {
    let carry = buf[i] ?? 0;
    for (let j = 0; j < digits.length; j++) {
      carry += (digits[j] ?? 0) * 256;
      digits[j] = carry % 58; carry = Math.floor(carry / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  let out = '';
  for (let i = 0; i < zeros; i++) out += B58_ALPH[0];
  for (let i = digits.length - 1; i >= 0; i--) out += B58_ALPH[digits[i] ?? 0];
  return out;
}

function b58decode(s: string): Uint8Array {
  if (s.length === 0) return new Uint8Array(0);
  let zeros = 0;
  while (zeros < s.length && s[zeros] === '1') zeros++;
  const lookup: Record<string, number> = {};
  for (let i = 0; i < B58_ALPH.length; i++) lookup[B58_ALPH[i] as string] = i;
  const bytes: number[] = [];
  for (const ch of s) {
    const v = lookup[ch];
    if (v === undefined) throw new Error(`invalid base58 character: ${ch}`);
    let carry = v;
    for (let j = 0; j < bytes.length; j++) {
      carry += (bytes[j] ?? 0) * 58;
      bytes[j] = carry & 0xff; carry >>= 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  const out = new Uint8Array(zeros + bytes.length);
  for (let i = 0; i < bytes.length; i++) out[zeros + bytes.length - 1 - i] = bytes[i] ?? 0;
  return out;
}

export function toBase58(b: Uint8Array): string   { return b58encode(b); }
export function fromBase58(s: string): Uint8Array { return new Uint8Array(b58decode(s)); }

// --- Hex (string) ---
export function toHex(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}
export function fromHex(s: string): Uint8Array {
  const clean = s.replace(/^0x/, '').replace(/\s+/g, '');
  if (clean.length % 2 !== 0) throw new Error('hex string must have even length');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) throw new Error(`invalid hex at position ${i * 2}`);
    out[i] = byte;
  }
  return out;
}

// --- Binary (string of '0'/'1') ---
export function toBinary(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(2).padStart(8, '0')).join('');
}
export function fromBinary(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '');
  if (clean.length % 8 !== 0) throw new Error('binary string must be a multiple of 8 bits');
  const out = new Uint8Array(clean.length / 8);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(clean.slice(i * 8, i * 8 + 8), 2);
    if (Number.isNaN(byte)) throw new Error('invalid binary');
    out[i] = byte;
  }
  return out;
}

// --- Octal ---
export function toOctal(b: Uint8Array): string {
  return Array.from(b).map((x) => x.toString(8).padStart(3, '0')).join('');
}
export function fromOctal(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '');
  if (clean.length % 3 !== 0) throw new Error('octal string must be a multiple of 3 digits');
  const out = new Uint8Array(clean.length / 3);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(clean.slice(i * 3, i * 3 + 3), 8);
    if (Number.isNaN(byte)) throw new Error('invalid octal');
    out[i] = byte;
  }
  return out;
}

// --- Decimal (bigint) ---
export function toDecimal(b: Uint8Array): string {
  if (b.length === 0) return '0';
  let n = 0n;
  for (const byte of b) n = (n << 8n) | BigInt(byte);
  return n.toString(10);
}
export function fromDecimal(s: string): Uint8Array {
  const clean = s.replace(/\s+/g, '');
  if (!/^\d+$/.test(clean)) throw new Error('decimal must be digits only');
  if (clean === '0') return new Uint8Array(0);
  let n = BigInt(clean);
  const out: number[] = [];
  while (n > 0n) { out.unshift(Number(n & 0xffn)); n >>= 8n; }
  return new Uint8Array(out);
}
