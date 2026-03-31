import { defineCommand } from 'citty';
import { generatePassword } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const passwordLeaf = defineCommand({
  meta: {
    name: 'password',
    description: 'Generate a cryptographically random password.',
  },
  args: {
    length:           { type: 'string', default: '20', description: 'Length 1-1024.' },
    lower:            { type: 'boolean', description: 'Disable lowercase (use --no-lower).' },
    upper:            { type: 'boolean', description: 'Disable uppercase (use --no-upper).' },
    digits:           { type: 'boolean', description: 'Disable digits (use --no-digits).' },
    symbols:          { type: 'boolean', description: 'Disable symbols (use --no-symbols).' },
    excludeAmbiguous: { type: 'boolean', shortAlias: 'x', description: 'Exclude ambiguous characters.' },
    requireEach:      { type: 'boolean', shortAlias: 'r', description: 'Require each class at least once.' },
    count:            { type: 'string', default: '1', description: 'How many to print.' },
  },
  async run({ args }) {
    try {
      // citty sets args.length only on --length; the -l alias populates args.l.
      const lengthRaw = (args['length'] as string | undefined) ?? '20';
      const length = Number.parseInt(lengthRaw, 10);
      const count = Math.max(1, Number.parseInt((args['count'] as string | undefined) ?? '1', 10));

      if (!Number.isInteger(length) || length < 1 || length > 1024) {
        printError(`--length must be an integer in [1, 1024], got "${lengthRaw}"`);
        process.exitCode = 64;
        return;
      }
      if (!Number.isInteger(count) || count < 1 || count > 100) {
        printError('--count must be an integer in [1, 100]');
        process.exitCode = 64;
        return;
      }

      // citty auto-negates --no-X to args.X = false; treat undefined as default-true.
      const opts = {
        length,
        lower:            args.lower    !== false,
        upper:            args.upper    !== false,
        digits:           args.digits   !== false,
        symbols:          args.symbols  !== false,
        excludeAmbiguous: Boolean(args.excludeAmbiguous),
        requireEach:      Boolean(args.requireEach),
      };

      const out: string[] = [];
      for (let i = 0; i < count; i++) out.push(generatePassword(opts));
      printRaw(out.join('\n'));
    } catch (e) {
      printError(e instanceof Error ? e.message : String(e));
      process.exitCode = 1;
    }
  },
});
