import { createHash } from "node:crypto";
import { md5 } from "../internal/md5.js";
import { secureRandomBytes } from "../internal/random.js";

export type UuidVersion = "v1" | "v3" | "v4" | "v5" | "v7";

export const NS_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
export const NS_URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
export const NS_OID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
export const NS_X500 = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";

function uuidToBytes(u: string): Uint8Array {
  const clean = u.replace(/-/g, "");
  if (clean.length !== 32) throw new RangeError(`invalid UUID string: ${u}`);
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    const byte = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) throw new RangeError(`invalid hex in namespace: ${u}`);
    out[i] = byte;
  }
  return out;
}

function bytesToUuid(b: Uint8Array): string {
  const h: string[] = [];
  for (let i = 0; i < 16; i++) h.push((b[i] ?? 0).toString(16).padStart(2, "0"));
  return (
    h.slice(0, 4).join("") +
    "-" +
    h.slice(4, 6).join("") +
    "-" +
    h.slice(6, 8).join("") +
    "-" +
    h.slice(8, 10).join("") +
    "-" +
    h.slice(10, 16).join("")
  );
}

function uuidV1(): string {
  const ts100ns = BigInt(Date.now()) * 10000n + 0x01b21dd213814000n;
  const timeLow = Number(ts100ns & 0xffffffffn);
  const timeMid = Number((ts100ns >> 32n) & 0xffffn);
  const timeHi = Number((ts100ns >> 48n) & 0x0fffn);
  const clockSeq = secureRandomBytes(2);
  const node = secureRandomBytes(6);
  clockSeq[0] = ((clockSeq[0] ?? 0) & 0x3f) | 0x80;
  const b = new Uint8Array(16);
  b[0] = (timeLow >> 24) & 0xff;
  b[1] = (timeLow >> 16) & 0xff;
  b[2] = (timeLow >> 8) & 0xff;
  b[3] = timeLow & 0xff;
  b[4] = (timeMid >> 8) & 0xff;
  b[5] = timeMid & 0xff;
  b[6] = ((timeHi >> 8) & 0x0f) | 0x10;
  b[7] = timeHi & 0xff;
  b[8] = clockSeq[0] ?? 0;
  b[9] = clockSeq[1] ?? 0;
  for (let i = 0; i < 6; i++) b[10 + i] = node[i] ?? 0;
  return bytesToUuid(b);
}

function uuidV3orV5(name: string, namespace: string, version: 3 | 5): string {
  const nsBytes = uuidToBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(nsBytes.length + nameBytes.length);
  data.set(nsBytes, 0);
  data.set(nameBytes, nsBytes.length);
  // v3 = MD5, v5 = SHA-1. We use a pure-JS MD5 for v3 because the polyfilled
  // createHash('md5') is unreliable in browser bundles. SHA-1 is small enough
  // to also ship pure-JS for parity, but createHash('sha1') works once we
  // include `stream` in the vite polyfills (see apps/web/vite.config.ts).
  const digest = version === 3 ? md5(data) : createHash("sha1").update(data).digest();
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = digest[i] ?? 0;
  out[6] = ((out[6] ?? 0) & 0x0f) | (version === 5 ? 0x50 : 0x30);
  out[8] = ((out[8] ?? 0) & 0x3f) | 0x80;
  return bytesToUuid(out);
}

function uuidV4(): string {
  const b = secureRandomBytes(16);
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x40;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  return bytesToUuid(b);
}

function uuidV7(): string {
  const ts = Date.now();
  const b = secureRandomBytes(16);
  b[0] = (ts / 2 ** 40) & 0xff;
  b[1] = (ts / 2 ** 32) & 0xff;
  b[2] = (ts / 2 ** 24) & 0xff;
  b[3] = (ts / 2 ** 16) & 0xff;
  b[4] = (ts / 2 ** 8) & 0xff;
  b[5] = ts & 0xff;
  b[6] = ((b[6] ?? 0) & 0x0f) | 0x70;
  b[8] = ((b[8] ?? 0) & 0x3f) | 0x80;
  return bytesToUuid(b);
}

const CUID_ALPH = "0123456789abcdefghijklmnopqrstuvwxyz";
export function generateCuid(length = 24): string {
  if (length < 8 || length > 32) throw new RangeError("CUID length must be in [8, 32]");
  const b = secureRandomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += CUID_ALPH[(b[i] ?? 0) % 36] as string;
  return `c${out}`;
}

const NANOID_ALPH = "useandom-_.0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
export function generateNanoId(size = 21, alphabet = NANOID_ALPH): string {
  if (size < 1) throw new RangeError("size must be >= 1");
  if (alphabet.length < 1) throw new RangeError("alphabet must not be empty");
  const out: string[] = new Array(size);
  const mask = (1 << Math.ceil(Math.log2(alphabet.length))) - 1;
  for (let i = 0; i < size; i++) {
    let r: number;
    do {
      r = (secureRandomBytes(1)[0] ?? 0) & mask;
    } while (r >= alphabet.length);
    out[i] = alphabet[r] as string;
  }
  return out.join("");
}

const ULID_ALPH = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function generateUlid(): string {
  const ts = Date.now();
  const tsChars: string[] = [];
  let t = BigInt(ts);
  for (let i = 9; i >= 0; i--) {
    tsChars[i] = ULID_ALPH[Number(t % 32n)] as string;
    t = t / 32n;
  }
  const r = secureRandomBytes(10);
  const rChars: string[] = [];
  for (let i = 15; i >= 0; i--) rChars[i] = ULID_ALPH[(r[15 - i] ?? 0) % 32] as string;
  return tsChars.join("") + rChars.join("");
}

const KSUID_EPOCH = 1400000000;
const KSUID_ALPH = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export function generateKsuid(): string {
  const ts = Date.now() / 1000 - KSUID_EPOCH;
  const tsBuf = new Uint8Array(4);
  tsBuf[0] = (ts >> 24) & 0xff;
  tsBuf[1] = (ts >> 16) & 0xff;
  tsBuf[2] = (ts >> 8) & 0xff;
  tsBuf[3] = ts & 0xff;
  const rand = secureRandomBytes(16);
  const full = new Uint8Array(20);
  full.set(tsBuf, 0);
  full.set(rand, 4);
  const digits: number[] = [];
  for (const byte of full) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += (digits[i] ?? 0) * 256;
      digits[i] = carry % 62;
      carry = Math.floor(carry / 62);
    }
    while (carry > 0) {
      digits.push(carry % 62);
      carry = Math.floor(carry / 62);
    }
  }
  while (digits.length < 27) digits.unshift(0);
  let out = "";
  for (let i = digits.length - 1; i >= 0; i--) out += KSUID_ALPH[digits[i] ?? 0];
  return out.slice(-27);
}

export type IdKind = "uuid" | "cuid" | "nanoid" | "ulid" | "ksuid";

export interface UuidOptions {
  version?: UuidVersion;
  case?: "lower" | "upper";
  name?: string;
  namespace?: string;
}

export function generateUuid(opts: UuidOptions = { version: "v4" }): string {
  let u: string;
  if (opts.version === "v1") u = uuidV1();
  else if (opts.version === "v3") u = uuidV3orV5(opts.name ?? "gsec", opts.namespace ?? NS_DNS, 3);
  else if (opts.version === "v4") u = uuidV4();
  else if (opts.version === "v5") u = uuidV3orV5(opts.name ?? "gsec", opts.namespace ?? NS_DNS, 5);
  else u = uuidV7();
  return opts.case === "upper" ? u.toUpperCase() : u;
}

export function generateUuids(count: number, opts: UuidOptions = { version: "v4" }): string[] {
  if (!Number.isInteger(count) || count < 1 || count > 1000)
    throw new RangeError("count must be an integer in [1, 1000]");
  const out: string[] = new Array(count);
  for (let i = 0; i < count; i++) out[i] = generateUuid(opts);
  return out;
}
