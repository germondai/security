import {
  toBase32,
  toBase32Hex,
  toBase58,
  toBase64,
  toBase64Url,
  toBinary,
  toDecimal,
  toHex,
  toOctal,
} from "@germondai/security";
import { defineCommand } from "citty";
import { printError, printSuccess } from "../ui/output.js";
import { readInput } from "../utils/input.js";

function toBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export const encodeCmd = defineCommand({
  meta: {
    name: "encode",
    description: "Encode text/bytes to base64/base32/base58/hex/binary/octal/decimal.",
  },
  args: {
    to: {
      type: "string",
      required: true,
      description:
        "base64 | base64url | base32 | base32hex | base58 | hex | binary | octal | decimal",
    },
    input: { type: "string", description: "Input (string, file, or stdin)." },
  },
  run({ args }) {
    try {
      const text = readInput(args.input as string | undefined);
      const bytes = toBytes(text);
      const to = (args.to ?? "hex") as string;
      let out = "";
      switch (to) {
        case "base64":
          out = toBase64(bytes);
          break;
        case "base64url":
          out = toBase64Url(bytes);
          break;
        case "base32":
          out = toBase32(bytes);
          break;
        case "base32hex":
          out = toBase32Hex(bytes);
          break;
        case "base58":
          out = toBase58(bytes);
          break;
        case "hex":
          out = toHex(bytes);
          break;
        case "binary":
          out = toBinary(bytes);
          break;
        case "octal":
          out = toOctal(bytes);
          break;
        case "decimal":
          out = toDecimal(bytes);
          break;
        default:
          throw new Error(`unknown --to: ${to}`);
      }
      printSuccess(out);
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});
