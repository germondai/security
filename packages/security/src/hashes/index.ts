import { Buffer } from "node:buffer";
import {
  pbkdf2 as _pbkdf2,
  scrypt as _scrypt,
  createHash as nodeCreateHash,
  createHmac as nodeCreateHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { sha } from "../internal/crypto-shim.js";

type ScryptFn = (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem?: number },
  cb: (err: Error | null, key: Buffer) => void,
) => void;
type Pbkdf2Fn = (
  password: string | Buffer,
  salt: string | Buffer,
  iterations: number,
  keylen: number,
  digest: string,
  cb: (err: Error | null, key: Buffer) => void,
) => void;

function promisifyScrypt(fn: ScryptFn) {
  return (
    password: string | Buffer,
    salt: string | Buffer,
    keylen: number,
    options: { N: number; r: number; p: number; maxmem?: number },
  ): Promise<Buffer> =>
    new Promise<Buffer>((resolve, reject) => {
      try {
        fn(password, salt, keylen, options, (err, key) => {
          if (err) reject(err);
          else resolve(key);
        });
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
}
function promisifyPbkdf2(fn: Pbkdf2Fn) {
  return (
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keylen: number,
    digest: string,
  ): Promise<Buffer> =>
    new Promise<Buffer>((resolve, reject) => {
      try {
        fn(password, salt, iterations, keylen, digest, (err, key) => {
          if (err) reject(err);
          else resolve(key);
        });
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
    });
}

const scrypt = promisifyScrypt(_scrypt as unknown as ScryptFn);
const pbkdf2 = promisifyPbkdf2(_pbkdf2 as unknown as Pbkdf2Fn);

export type ShaAlg = "sha1" | "sha256" | "sha384" | "sha512";

export interface SaltedHashResult {
  hash: string;
  algorithm: ShaAlg;
  salt: string | null;
}

/** Synchronous SHA — Node/Bun only. For browser, use `hashShaAsync`. */
export function hashSha(input: string, alg: ShaAlg = "sha256", salt?: string): SaltedHashResult {
  const h = nodeCreateHash(alg);
  if (salt) h.update(salt, "utf8");
  h.update(input, "utf8");
  return { hash: h.digest("hex"), algorithm: alg, salt: salt ?? null };
}

/** Async SHA — works in both Node and browser (uses WebCrypto in browser). */
export async function hashShaAsync(
  input: string,
  alg: ShaAlg = "sha256",
  salt?: string,
): Promise<SaltedHashResult> {
  try {
    const hash = await sha(input, alg, salt);
    return { hash, algorithm: alg, salt: salt ?? null };
  } catch (e) {
    throw new Error(`hashShaAsync(${alg}) failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** HMAC — Node only (WebCrypto doesn't expose HMAC uniformly). */
export function hmacSign(key: string, data: string, alg: ShaAlg = "sha256"): string {
  return nodeCreateHmac(alg, key).update(data, "utf8").digest("hex");
}
export function hmacVerify(
  key: string,
  data: string,
  expected: string,
  alg: ShaAlg = "sha256",
): boolean {
  const got = Buffer.from(hmacSign(key, data, alg), "hex");
  const exp = Buffer.from(expected, "hex");
  if (got.length !== exp.length) return false;
  return timingSafeEqual(got, exp);
}

export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface PasswordHashOptions {
  cost?: number;
  saltBytes?: number;
  keyLength?: number;
}
export interface PasswordHashResult {
  hash: string;
  salt: string;
  algorithm: "scrypt";
  params: { N: number; r: number; p: number; keyLength: number };
}
export async function hashPassword(
  password: string,
  opts: PasswordHashOptions = {},
): Promise<PasswordHashResult> {
  const N = opts.cost ?? 16384,
    r = 8,
    p = 1;
  const keyLength = opts.keyLength ?? 64;
  const salt = randomBytes(opts.saltBytes ?? 16);
  const key = await scrypt(password, salt, keyLength, { N, r, p });
  return {
    hash: key.toString("hex"),
    salt: salt.toString("hex"),
    algorithm: "scrypt",
    params: { N, r, p, keyLength },
  };
}
export async function verifyPassword(
  password: string,
  stored: PasswordHashResult,
): Promise<boolean> {
  const salt = Buffer.from(stored.salt, "hex");
  const key = await scrypt(password, salt, stored.params.keyLength, {
    N: stored.params.N,
    r: stored.params.r,
    p: stored.params.p,
  });
  if (key.length !== stored.hash.length / 2) return false;
  return timingSafeEqual(key, Buffer.from(stored.hash, "hex"));
}

export interface Pbkdf2Options {
  iterations?: number;
  saltBytes?: number;
  keyLength?: number;
  digest?: "sha256" | "sha512";
}
export async function pbkdf2Hash(
  password: string,
  opts: Pbkdf2Options = {},
): Promise<PasswordHashResult> {
  const iter = opts.iterations ?? 100_000;
  const salt = randomBytes(opts.saltBytes ?? 16);
  const keylen = opts.keyLength ?? 32;
  const digest = opts.digest ?? "sha256";
  const key = await pbkdf2(password, salt, iter, keylen, digest);
  return {
    hash: key.toString("hex"),
    salt: salt.toString("hex"),
    algorithm: "scrypt",
    params: { N: 0, r: 0, p: iter, keyLength: keylen },
  };
}
