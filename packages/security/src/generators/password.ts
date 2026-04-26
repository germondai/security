import { secureRandomBytes, secureRandomPick } from "../internal/random.js";
import type { CharsetClass, PasswordOptions } from "../types.js";

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";
const AMBIGUOUS = new Set(["0", "O", "o", "1", "l", "I", "|", "`", '"', "'"]);

const CLASS_CHARS = { lower: LOWER, upper: UPPER, digits: DIGITS } as const;

function classEnabled(o: PasswordOptions, c: "lower" | "upper" | "digits"): boolean {
  if (c === "lower") return o.lower !== false;
  if (c === "upper") return o.upper !== false;
  return o.digits !== false;
}

function buildClassPool(c: "lower" | "upper" | "digits", o: PasswordOptions): string {
  const raw = CLASS_CHARS[c];
  return o.excludeAmbiguous ? [...raw].filter((x) => !AMBIGUOUS.has(x)).join("") : raw;
}

function buildSymbolPool(o: PasswordOptions): string {
  const raw = o.symbolSet ?? DEFAULT_SYMBOLS;
  return o.excludeAmbiguous ? [...raw].filter((x) => !AMBIGUOUS.has(x)).join("") : raw;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (secureRandomBytes(1)[0] ?? 0) % (i + 1);
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

export function generatePassword(options: PasswordOptions): string {
  if (!Number.isInteger(options.length) || options.length < 1) {
    throw new RangeError(`length must be a positive integer, got ${options.length}`);
  }
  if (options.length > 1024) {
    throw new RangeError(`length must be <= 1024, got ${options.length}`);
  }

  const active: { pool: string; cls: CharsetClass }[] = [];
  if (classEnabled(options, "lower")) {
    const p = buildClassPool("lower", options);
    if (p) active.push({ pool: p, cls: "lower" });
  }
  if (classEnabled(options, "upper")) {
    const p = buildClassPool("upper", options);
    if (p) active.push({ pool: p, cls: "upper" });
  }
  if (classEnabled(options, "digits")) {
    const p = buildClassPool("digits", options);
    if (p) active.push({ pool: p, cls: "digits" });
  }
  if (options.symbols !== false) {
    const p = buildSymbolPool(options);
    if (p) active.push({ pool: p, cls: "symbols" });
  }
  if (active.length === 0) {
    throw new Error("generatePassword: no characters left in the pool");
  }
  if (options.requireEach && options.length < active.length) {
    throw new RangeError(`length must be >= ${active.length} when requireEach is true`);
  }

  if (!options.requireEach) {
    const alphabet = active.map((c) => c.pool).join("");
    const out = new Array<string>(options.length);
    for (let i = 0; i < options.length; i++) out[i] = secureRandomPick([...alphabet]);
    return out.join("");
  }

  const chars = active.map((c) => secureRandomPick([...c.pool]));
  const union = active.map((c) => c.pool).join("");
  for (let i = chars.length; i < options.length; i++) {
    chars.push(secureRandomPick([...union]));
  }
  return shuffle(chars).join("");
}
