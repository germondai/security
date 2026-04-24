export function shannonEntropy(s: string): number {
  if (s.length === 0) return 0;
  const counts = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let h = 0;
  const len = s.length;
  for (const n of counts.values()) {
    const p = n / len;
    h -= p * Math.log2(p);
  }
  return h;
}

const CLASS_POOLS = { lower: 26, upper: 26, digits: 10, symbols: 32 } as const;

export function detectPoolSize(s: string): number {
  let pool = 0;
  let hasLower = false,
    hasUpper = false,
    hasDigit = false,
    hasSymbol = false;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0x61 && c <= 0x7a) hasLower = true;
    else if (c >= 0x41 && c <= 0x5a) hasUpper = true;
    else if (c >= 0x30 && c <= 0x39) hasDigit = true;
    else if (c < 0x20 || c > 0x7e) hasSymbol = true;
    else hasSymbol = true;
  }
  if (hasLower) pool += CLASS_POOLS.lower;
  if (hasUpper) pool += CLASS_POOLS.upper;
  if (hasDigit) pool += CLASS_POOLS.digits;
  if (hasSymbol) pool += CLASS_POOLS.symbols;
  return pool;
}

export function naiveEntropyBits(s: string): { bits: number; poolSize: number } {
  const pool = detectPoolSize(s);
  const bits = pool === 0 ? 0 : s.length * Math.log2(pool);
  return { bits, poolSize: pool };
}
