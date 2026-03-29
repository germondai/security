import { defineCommand } from 'citty';
import { fromBase64, fromBase64Url, fromBase32, fromBase32Hex, fromBase58, fromHex, fromBinary, fromOctal, fromDecimal } from '@germondai/security';
import { readInput } from '../utils/input.js';
import { printError, printSuccess } from '../ui/output.js';

export const decodeCmd = defineCommand({
  meta: { name: 'decode', description: 'Decode base64/base32/base58/hex/binary/octal/decimal to text.' },
  args: {
    from:  { type: 'string', required: true, description: 'base64 | base64url | base32 | base32hex | base58 | hex | binary | octal | decimal' },
    input: { type: 'string',                  description: 'Input (string, file, or stdin).' },
  },
  run({ args }) {
    try {
      const text = readInput(args['input'] as string | undefined);
      const from = (args['from'] ?? 'hex') as string;
      let bytes: Uint8Array;
      switch (from) {
        case 'base64':    bytes = fromBase64(text); break;
        case 'base64url': bytes = fromBase64Url(text); break;
        case 'base32':    bytes = fromBase32(text); break;
        case 'base32hex': bytes = fromBase32Hex(text); break;
        case 'base58':    bytes = fromBase58(text); break;
        case 'hex':       bytes = fromHex(text); break;
        case 'binary':    bytes = fromBinary(text); break;
        case 'octal':     bytes = fromOctal(text); break;
        case 'decimal':   bytes = fromDecimal(text); break;
        default: throw new Error(`unknown --from: ${from}`);
      }
      printSuccess(new TextDecoder('utf-8', { fatal: false }).decode(bytes));
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});
