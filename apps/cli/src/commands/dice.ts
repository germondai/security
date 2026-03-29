import { defineCommand } from 'citty';
import { rollDice, rollDiceMany, randomInt } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const diceLeaf = defineCommand({
  meta: { name: 'dice', description: 'Roll dice or generate random integers.' },
  args: {
    sides:    { type: 'string', shortAlias: 's', default: '6',   description: 'Number of sides (1-10000).' },
    count:    { type: 'string', default: '1',   description: 'How many rolls (1-10000).' },
    sum:      { type: 'boolean',                                description: 'Print only the sum.' },
    min:      { type: 'string',                                 description: 'For `random-int`: lower bound (inclusive).' },
    max:      { type: 'string',                                 description: 'For `random-int`: upper bound (inclusive).' },
  },
  run({ args }) {
    try {
      const sides = Number.parseInt(args['sides'] ?? '6', 10);
      const count = Number.parseInt(args['count'] ?? '1', 10);

      // Random integer mode if both min and max provided.
      if (args['min'] !== undefined && args['max'] !== undefined) {
        const lo = Number.parseInt(args['min'] as string, 10);
        const hi = Number.parseInt(args['max'] as string, 10);
        if (!Number.isInteger(lo) || !Number.isInteger(hi) || hi < lo) {
          printError('--min/--max must be integers with max >= min');
          process.exitCode = 64;
          return;
        }
        printRaw(String(randomInt(lo, hi)));
        return;
      }

      if (!Number.isInteger(sides) || sides < 1 || sides > 10000) {
        printError('--sides must be in [1, 10000]');
        process.exitCode = 64;
        return;
      }
      if (!Number.isInteger(count) || count < 1 || count > 10000) {
        printError('--count must be in [1, 10000]');
        process.exitCode = 64;
        return;
      }
      const rolls = rollDiceMany(count, sides);
      if (args['sum']) {
        let s = 0;
        for (const r of rolls) s += r;
        printRaw(String(s));
      } else {
        printRaw(rolls.join(' '));
      }
      void rollDice;
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});