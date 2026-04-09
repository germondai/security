import { secureRandomBytes } from '../internal/random.js';

export function randomPort(): number {
  const b = secureRandomBytes(2);
  return 1024 + (((b[0] ?? 0) << 8 | (b[1] ?? 0)) % (65535 - 1024 + 1));
}

export function randomPrivateIPv4(): string {
  // Random private IPv4 in 10.0.0.0/8
  const b = secureRandomBytes(4);
  return [10, b[1] ?? 0, b[2] ?? 0, (b[3] ?? 0) === 0 ? 1 : (b[3] ?? 0)].join('.');
}

export function randomMac(): string {
  const b = secureRandomBytes(6);
  b[0] = ((b[0] ?? 0) & 0xfe) | 0x02;
  return Array.from(b).map(x => (x ?? 0).toString(16).padStart(2, '0')).join(':');
}
