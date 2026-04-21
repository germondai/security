import {
  ecdsaSign,
  ecdsaVerify,
  ed25519Sign,
  ed25519Verify,
  rsaSign,
  rsaVerify,
} from "@germondai/security";
import { defineCommand } from "citty";
import { printError, printRaw, printRawJson } from "../ui/output.js";
import { readInput } from "../utils/input.js";

export const signLeaf = defineCommand({
  meta: { name: "sign", description: "Sign data with an asymmetric private key." },
  args: {
    algorithm: { type: "string", required: true, description: "rsa | ed25519 | ecdsa" },
    "private-key": {
      type: "string",
      required: true,
      description: "PEM-encoded private key (or @file or stdin).",
    },
    input: { type: "string", description: "Data to sign (string, file, or stdin)." },
    alg: {
      type: "string",
      default: "sha256",
      description: "For rsa/ecdsa: sha256 | sha384 | sha512",
    },
    encoding: { type: "string", default: "base64", description: "base64 | hex" },
  },
  run({ args }) {
    try {
      const data = readInput(args.input as string | undefined);
      const keyPem = readInput(args["private-key"] as string | undefined);
      const hashAlg = (args.alg ?? "sha256") as "sha256" | "sha384" | "sha512";
      const enc = (args.encoding as "base64" | "hex") ?? "base64";
      let sig: string;
      const algo = (args.algorithm ?? "rsa") as string;
      if (algo === "rsa") sig = rsaSign(keyPem, data, hashAlg);
      else if (algo === "ed25519") sig = ed25519Sign(keyPem, data);
      else if (algo === "ecdsa") sig = ecdsaSign(keyPem, data, hashAlg);
      else throw new Error(`unknown --algorithm: ${algo}`);
      const out = enc === "hex" ? Buffer.from(sig, "base64").toString("hex") : sig;
      printRaw(out);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});

export const verifyLeaf = defineCommand({
  meta: { name: "verify", description: "Verify a signature against data and a public key." },
  args: {
    algorithm: { type: "string", required: true, description: "rsa | ed25519 | ecdsa" },
    "public-key": {
      type: "string",
      required: true,
      description: "PEM-encoded public key (or @file or stdin).",
    },
    input: { type: "string", description: "Data that was signed." },
    signature: { type: "string", required: true, description: "Base64 or hex signature." },
    alg: {
      type: "string",
      default: "sha256",
      description: "For rsa/ecdsa: sha256 | sha384 | sha512",
    },
    encoding: { type: "string", default: "base64", description: "base64 | hex" },
  },
  run({ args }) {
    try {
      const data = readInput(args.input as string | undefined);
      const keyPem = readInput(args["public-key"] as string | undefined);
      const hashAlg = (args.alg ?? "sha256") as "sha256" | "sha384" | "sha512";
      const enc = (args.encoding as "base64" | "hex") ?? "base64";
      const sig =
        enc === "hex"
          ? Buffer.from(args.signature as string, "hex").toString("base64")
          : (args.signature as string);
      let valid: boolean;
      const algo = (args.algorithm ?? "rsa") as string;
      if (algo === "rsa") valid = rsaVerify(keyPem, data, sig, hashAlg);
      else if (algo === "ed25519") valid = ed25519Verify(keyPem, data, sig);
      else if (algo === "ecdsa") valid = ecdsaVerify(keyPem, data, sig, hashAlg);
      else throw new Error(`unknown --algorithm: ${algo}`);
      printRawJson({ valid });
      if (!valid) process.exitCode = 1;
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});
