import { toBase64, toBase64Url } from "../internal/encoding.js";
import { secureRandomBytes } from "../internal/random.js";

export interface SecretOptions {
  bytes: number;
  encoding: "hex" | "base64" | "base64url";
  prefix?: string;
}

export function generateSecret(options: SecretOptions): string {
  if (!Number.isInteger(options.bytes) || options.bytes < 1 || options.bytes > 1024) {
    throw new RangeError("bytes must be an integer in [1, 1024]");
  }
  const b = secureRandomBytes(options.bytes);
  let body: string;
  if (options.encoding === "hex")
    body = Array.from(b)
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  else if (options.encoding === "base64") body = toBase64(b);
  else body = toBase64Url(b);
  return (options.prefix ?? "") + body;
}

/** Stripe / GitHub / better-auth style API key. */
export function generateApiKey(opts: { prefix: string; bytes?: number }): string {
  return generateSecret({ bytes: opts.bytes ?? 32, encoding: "base64url", prefix: opts.prefix });
}
