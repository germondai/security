import {
  ecdsaGenerateKeyPair,
  ed25519GenerateKeyPair,
  rsaGenerateKeyPair,
} from "@germondai/security";
import { defineCommand } from "citty";
import { printError, printRaw } from "../ui/output.js";
import { readInput } from "../utils/input.js";

const rsaLeaf = defineCommand({
  meta: { name: "rsa", description: "Generate an RSA key pair (PEM, SPKI/PKCS8)." },
  args: { size: { type: "string", default: "2048", description: "2048 | 3072 | 4096" } },
  run({ args }) {
    try {
      const size = Number.parseInt(args.size ?? "2048", 10) as 2048 | 3072 | 4096;
      const kp = rsaGenerateKeyPair(size);
      process.stdout.write(`${kp.privateKey}\n${kp.publicKey}`);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});

const edLeaf = defineCommand({
  meta: { name: "ed25519", description: "Generate an Ed25519 key pair." },
  run() {
    try {
      const kp = ed25519GenerateKeyPair();
      process.stdout.write(`${kp.privateKey}\n${kp.publicKey}`);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});

const ecLeaf = defineCommand({
  meta: { name: "ecdsa", description: "Generate an ECDSA key pair (P-256/P-384/P-521)." },
  args: { curve: { type: "string", default: "P-256", description: "P-256 | P-384 | P-521" } },
  run({ args }) {
    try {
      const kp = ecdsaGenerateKeyPair(args.curve as "P-256" | "P-384" | "P-521");
      process.stdout.write(`${kp.privateKey}\n${kp.publicKey}`);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});

const convertLeaf = defineCommand({
  meta: { name: "convert", description: "Convert a key between PEM, DER, and JWK formats." },
  args: {
    from: { type: "string", required: true, description: "pem | der | jwk" },
    to: { type: "string", required: true, description: "pem | der | jwk" },
    kind: { type: "string", required: true, description: "public | private" },
    input: {
      type: "string",
      required: true,
      description: "PEM/DER (string) or JWK (string of JSON). File path or @file also works.",
    },
  },
  async run({ args }) {
    try {
      const { pemToJwk, jwkToPem, pemToDer, derToPem } = await import("@germondai/security");
      const from = (args.from as string).toLowerCase();
      const to = (args.to as string).toLowerCase();
      const kind = args.kind as "public" | "private";
      const raw = readInput(args.input as string);
      let out: string;
      if (from === "pem" && to === "jwk") {
        out = JSON.stringify(pemToJwk(raw, kind), null, 2);
      } else if (from === "jwk" && to === "pem") {
        out = jwkToPem(JSON.parse(raw), kind);
      } else if (from === "pem" && to === "der") {
        out = pemToDer(raw, kind).toString("base64");
      } else if (from === "der" && to === "pem") {
        out = derToPem(raw, kind);
      } else if (from === "jwk" && to === "der") {
        out = pemToDer(jwkToPem(JSON.parse(raw), kind), kind).toString("base64");
      } else if (from === "der" && to === "jwk") {
        out = JSON.stringify(pemToJwk(derToPem(raw, kind), kind), null, 2);
      } else {
        throw new Error(`unsupported conversion: ${from} -> ${to}`);
      }
      printRaw(out);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});

export const keyCmd = defineCommand({
  meta: { name: "key", description: "Generate / convert asymmetric keys." },
  subCommands: { rsa: rsaLeaf, ed25519: edLeaf, ecdsa: ecLeaf, convert: convertLeaf },
});
