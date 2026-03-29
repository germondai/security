import { defineCommand } from 'citty';
import { aesGcmEncrypt } from '@germondai/security';
import { readInput } from '../utils/input.js';
import { printError, printRawJson } from '../ui/output.js';

export const enc = defineCommand({
  meta: { name: 'enc', description: 'Encrypt data (AES-256-GCM).' },
  args: {
    key:      { type: 'string', required: true, description: 'Passphrase (will be SHA-256-derived to 32 bytes).' },
    input:    { type: 'string',                  description: 'Plaintext (string, file, or stdin).' },
    aad:      { type: 'string',                  description: 'Additional authenticated data (optional).' },
    encoding: { type: 'string', default: 'base64', description: 'base64 | hex' },
  },
  run({ args }) {
    try {
      const text = readInput(args['input'] as string | undefined);
      const opts: Parameters<typeof aesGcmEncrypt>[1] = {
        key: args['key'] as string,
        outputEncoding: (args['encoding'] as 'base64' | 'hex') ?? 'base64',
      };
      if (args['aad']) opts.aad = args['aad'] as string;
      const out = aesGcmEncrypt(text, opts);
      printRawJson({
        ciphertext: out.ciphertext,
        iv: out.iv,
        authTag: out.authTag,
        algorithm: out.algorithm,
        encoding: out.encoding,
      });
    } catch (e) {
      printError(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  },
});
