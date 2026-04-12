import { defineCommand } from 'citty';
import { generatePassphrase } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const passphraseLeaf = defineCommand({
  meta: { name: 'passphrase', description: 'Diceware-style passphrase (2-32 words).' },
  args: {
    words:        { type: 'string', default: '8',  description: 'Word count (2-32).' },
    separator:    { type: 'string', default: '-',  description: 'Word separator.' },
    capitalize:   { type: 'boolean',                  description: 'Capitalize each word.' },
    'with-number':{ type: 'boolean',                  description: 'Append a random 0-999.' },
  },
  run({ args }) {
    try {
      const w = Number.parseInt(args['words'] ?? '8', 10);
      if (!Number.isInteger(w) || w < 2 || w > 32) {
        printError('--words must be in [2, 32]');
        process.exitCode = 64; return;
      }
      const out = generatePassphrase({
        words: w,
        separator: args['separator'] as string,
        capitalize: Boolean(args['capitalize']),
        includeNumber: Boolean(args['with-number']),
      });
      printRaw(out);
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});
