import { randomBytes } from 'node:crypto';

/**
 * Internal: a uniform random integer in [0, maxExclusive) using a fixed-width
 * byte source and rejection sampling. Avoids the modulo-bias that a naive
 * `randomBytes(N) % maxExclusive` would have when the range does not divide
 * the byte space evenly.
 *
 * Works in Node, Bun, and the browser (where we use vite-plugin-node-polyfills
 * which only polyfills `randomBytes`, not `randomInt` or `randomUUID`).
 */
function uniformInt(maxExclusive: number): number {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`maxExclusive must be a positive integer, got ${maxExclusive}`);
  }
  // Pick a width that comfortably fits maxExclusive.
  const bits = Math.ceil(Math.log2(maxExclusive));
  const bytes = Math.max(1, Math.ceil(bits / 8));
  // Compute the largest multiple of maxExclusive that fits in 2^(8*bytes).
  // Reject any draw >= limit to remove the bias from truncation.
  const limit = Math.floor((1 << (bytes * 8)) / maxExclusive) * maxExclusive;
  // Read into a regular array (avoid BigInt by keeping bytes within 32 bits).
  // For ranges up to 2^24 a 3-byte read suffices; for larger we widen.
  while (true) {
    const buf = randomBytes(bytes);
    let n = 0;
    for (let i = 0; i < bytes; i++) n = (n << 8) | (buf[i] ?? 0);
    if (n < limit) return n % maxExclusive;
  }
}

/**
 * Internal: RFC 4122 v4 UUID. We hand-roll the format because the browser
 * polyfill of `node:crypto` does not include `randomUUID`.
 */
function uuidV4Bytes(): Uint8Array {
  const b = randomBytes(16);
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40; // version 4
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80; // variant 10
  return b;
}

function uuidV4String(bytes: Uint8Array): string {
  const h: string[] = [];
  for (let i = 0; i < bytes.length; i++) h.push((bytes[i] ?? 0).toString(16).padStart(2, '0'));
  return (
    h.slice(0, 4).join('') + '-' +
    h.slice(4, 6).join('') + '-' +
    h.slice(6, 8).join('') + '-' +
    h.slice(8, 10).join('') + '-' +
    h.slice(10, 16).join('')
  );
}

export function secureRandomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length < 0) {
    throw new RangeError(`length must be a non-negative integer, got ${length}`);
  }
  return new Uint8Array(randomBytes(length));
}

export function secureRandomInt(minInclusive: number, maxExclusive: number): number {
  if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive)) {
    throw new RangeError('bounds must be integers');
  }
  if (maxExclusive <= minInclusive) {
    throw new RangeError('maxExclusive must be > minInclusive');
  }
  return minInclusive + uniformInt(maxExclusive - minInclusive);
}

export function secureRandomPick<T>(pool: readonly T[]): T {
  if (pool.length === 0) throw new RangeError('cannot pick from an empty pool');
  const idx = uniformInt(pool.length);
  return pool[idx] as T;
}

export function secureRandomUUID(): string {
  return uuidV4String(uuidV4Bytes());
}
