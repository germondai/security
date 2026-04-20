import { analyzeCmd } from "./analyze.js";
import { dec } from "./dec.js";
import { decodeCmd } from "./decode.js";
import { enc } from "./enc.js";
import { encodeCmd } from "./encode.js";
import { gen } from "./gen.js";
// slug intentionally removed — not a security primitive
import { hash } from "./hash.js";
import { jwtCmd } from "./jwt.js";
import { keyCmd } from "./key.js";
import { signLeaf, verifyLeaf } from "./sign.js";

export function registerCommands() {
  return {
    gen,
    hash,
    enc,
    dec,
    key: keyCmd,
    jwt: jwtCmd,
    encode: encodeCmd,
    decode: decodeCmd,
    analyze: analyzeCmd,
    sign: signLeaf,
    verify: verifyLeaf,
  } as unknown as Record<string, import("citty").CommandDef>;
}
