import { defineCommand } from 'citty';
import { generateSecret, generateApiKey } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const secretLeaf = defineCommand({
  meta: { name: 'secret', description: 'Generate a high-entropy secret (API key, token, etc).' },
  args: {
    bytes:    { type: 'string', default: '32',     description: 'Entropy in bytes (1-1024).' },
    encoding: { type: 'string', default: 'hex',    description: 'hex | base64 | base64url' },
    prefix:   { type: 'string', default: '',       description: 'Optional prefix (no whitespace, e.g. "sk_live_").' },
  },
  run({ args }) {
    try {
      const prefix = (args['prefix'] ?? '') as string;
      if (/\s/.test(prefix)) { printError('--prefix must not contain whitespace'); process.exitCode = 64; return; }
      const b = Number.parseInt(args['bytes'] ?? '32', 10);
      const enc = (args['encoding'] ?? 'hex') as 'hex' | 'base64' | 'base64url';
      const out = prefix
        ? generateApiKey({ prefix, bytes: b })
        : generateSecret({ bytes: b, encoding: enc });
      printRaw(out);
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});
