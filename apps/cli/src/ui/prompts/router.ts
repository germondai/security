import * as p from "@clack/prompts";
import pc from "picocolors";
import { passphraseWizard, passwordWizard, secretWizard, uuidWizard } from "./generators.js";
import {
  aesWizard,
  decodeWizard,
  encodeWizard,
  hmacWizard,
  keyPairWizard,
  shaWizard,
} from "./utilityWizards.js";

/** Run a wizard wrapped in try/catch so any thrown error is shown cleanly
 *  instead of bubbling out of runWizard and crashing the CLI. */
async function safe(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    p.log.error(`${name} wizard failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

type Category = "generators" | "hashes" | "ciphers" | "encoders" | "analyzers" | "quit";

export async function runWizard(): Promise<void> {
  p.intro(pc.bgMagenta(" gsec "));

  const top = await p.select({
    message: "What would you like to do?",
    options: [
      { value: "generators", label: "Generators  (password, secret, UUID...)" },
      { value: "hashes", label: "Hashes      (SHA, HMAC)" },
      { value: "ciphers", label: "Ciphers     (AES, key pairs)" },
      { value: "encoders", label: "Encoders    (base64, hex, base32...)" },
      { value: "analyzers", label: "Analyzers   (password strength)" },
      { value: "quit", label: "Quit" },
    ],
  });
  if (p.isCancel(top) || top === "quit") return p.outro("Bye!");
  // Each sub-wizard ends with its own `p.outro(...)`, so the router doesn't
  // print another one here — that was producing the duplicate "Done." bug.
  await dispatch(top as Category);
}

async function dispatch(top: Category): Promise<void> {
  switch (top) {
    case "generators": {
      const sub = await p.select({
        message: "Pick a generator",
        options: [
          { value: "password", label: "Password" },
          { value: "passphrase", label: "Passphrase" },
          { value: "uuid", label: "UUID / CUID / Nano ID / ULID / KSUID" },
          { value: "secret", label: "Secret / API key" },
        ],
      });
      if (p.isCancel(sub)) return;
      switch (sub) {
        case "password":
          await safe("Password", passwordWizard);
          break;
        case "passphrase":
          await safe("Passphrase", passphraseWizard);
          break;
        case "uuid":
          await safe("UUID", uuidWizard);
          break;
        case "secret":
          await safe("Secret", secretWizard);
          break;
      }
      return;
    }

    case "hashes": {
      const sub = await p.select({
        message: "Pick a hash",
        options: [
          { value: "sha", label: "SHA hash (SHA-1/256/384/512, optional salt)" },
          { value: "hmac", label: "HMAC sign / verify" },
        ],
      });
      if (p.isCancel(sub)) return;
      switch (sub) {
        case "sha":
          await safe("SHA", shaWizard);
          break;
        case "hmac":
          await safe("HMAC", hmacWizard);
          break;
      }
      return;
    }

    case "ciphers": {
      const sub = await p.select({
        message: "Pick a cipher",
        options: [
          { value: "aes", label: "AES-256-GCM (authenticated encryption)" },
          { value: "key", label: "Key pair (RSA / Ed25519 / ECDSA)" },
        ],
      });
      if (p.isCancel(sub)) return;
      switch (sub) {
        case "aes":
          await safe("AES", aesWizard);
          break;
        case "key":
          await safe("Key pair", keyPairWizard);
          break;
      }
      return;
    }

    case "encoders": {
      const sub = await p.select({
        message: "Pick an operation",
        options: [
          { value: "enc", label: "Encode (text -> base64/hex/...)" },
          { value: "dec", label: "Decode (base64/hex/... -> text)" },
        ],
      });
      if (p.isCancel(sub)) return;
      switch (sub) {
        case "enc":
          await safe("Encode", encodeWizard);
          break;
        case "dec":
          await safe("Decode", decodeWizard);
          break;
      }
      return;
    }

    case "analyzers": {
      p.log.warn("Use `gsec analyze --input <text>` to analyze a password from the CLI.");
      p.log.info("Or open the web UI at http://localhost:5173/analyzers/password-strength");
      p.outro("Done.");
      return;
    }
  }
}
