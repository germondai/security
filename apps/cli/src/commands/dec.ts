import { aesGcmDecrypt } from "@germondai/security";
import { defineCommand } from "citty";
import { printError, printRaw } from "../ui/output.js";

export const dec = defineCommand({
  meta: { name: "dec", description: "Decrypt AES-256-GCM data (output of `gsec enc`)." },
  args: {
    key: { type: "string", required: true, description: "Passphrase." },
    ciphertext: { type: "string", required: true, description: "Base64 or hex ciphertext." },
    iv: { type: "string", required: true, description: "IV hex." },
    "auth-tag": { type: "string", required: true, description: "Auth tag hex." },
    aad: { type: "string", description: "Optional AAD." },
    encoding: { type: "string", default: "base64", description: "base64 | hex" },
  },
  run({ args }) {
    try {
      const opts: Parameters<typeof aesGcmDecrypt>[0] = {
        key: args.key as string,
        ciphertext: args.ciphertext as string,
        iv: args.iv as string,
        authTag: args["auth-tag"] as string,
        encoding: (args.encoding as "base64" | "hex") ?? "base64",
      };
      if (args.aad) opts.aad = args.aad as string;
      const out = aesGcmDecrypt(opts);
      printRaw(out);
    } catch (e) {
      printError(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  },
});
