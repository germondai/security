/**
 * Cross-environment crypto helpers. Uses node:crypto when available,
 * falls back to the browser-native WebCrypto (crypto.subtle) for hashing.
 *
 * This is what the WEB uses for SHA — crypto-browserify (the Vite polyfill)
 * is partially broken in newer Vite versions ("Cannot read properties of
 * undefined (reading 'call')" from createHash().update() in some setups).
 */
import { createHash as nodeCreateHash } from "node:crypto";

const hasWebCrypto =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle !== "undefined";

function toBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += (arr[i] ?? 0).toString(16).padStart(2, "0");
  return out;
}

/** SHA hash, returns hex. Uses WebCrypto in browser, node:crypto in Node. */
export async function sha(
  input: string,
  alg: "sha1" | "sha256" | "sha384" | "sha512",
  salt?: string,
): Promise<string> {
  const data = salt ? salt + input : input;
  if (hasWebCrypto) {
    const subtle = (globalThis as { crypto: { subtle: SubtleCrypto } }).crypto.subtle;
    const webAlg =
      alg === "sha1"
        ? "SHA-1"
        : alg === "sha256"
          ? "SHA-256"
          : alg === "sha384"
            ? "SHA-384"
            : "SHA-512";
    const buf = await subtle.digest(webAlg, toBytes(data));
    return bytesToHex(buf);
  }
  return nodeCreateHash(alg).update(data, "utf8").digest("hex");
}

/** Synchronous SHA for environments where node:crypto is reliable (Node, Bun). */
export function shaSync(
  input: string,
  alg: "sha1" | "sha256" | "sha384" | "sha512",
  salt?: string,
): string {
  return nodeCreateHash(alg)
    .update(salt ? salt + input : input, "utf8")
    .digest("hex");
}
