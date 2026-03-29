import { defineCommand } from 'citty';
import { caesar, rot13 } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const cipherTextLeaf = defineCommand({
  meta: { name: 'cipher-text', description: 'Simple text ciphers: Caesar shift and ROT13.' },
  args: {
    cipher: { type: 'string', default: 'rot13', description: 'rot13 | caesar' },
    shift:  { type: 'string', default: '3',     description: 'Caesar shift (any integer).' },
    input:  { type: 'string',                    description: 'Text to encrypt. If omitted, read from stdin.' },
  },
  async run({ args }) {
    try {
      const cipher = (args['cipher'] ?? 'rot13') as 'rot13' | 'caesar';
      if (cipher !== 'rot13' && cipher !== 'caesar') {
        printError('--cipher must be rot13 | caesar');
        process.exitCode = 64;
        return;
      }
      const text = await readInput(args['input'] as string | undefined);
      const out = cipher === 'rot13'
        ? rot13(text)
        : caesar(text, Number.parseInt(args['shift'] ?? '3', 10));
      printRaw(out);
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

async function readInput(literal: string | undefined): Promise<string> {
  if (literal !== undefined && literal.length > 0) return literal;
  // Read from stdin if piped (avoids hanging when TTY).
  if (typeof process !== 'undefined' && process.stdin && process.stdin.isTTY !== true) {
    return await new Promise<string>((resolve, reject) => {
      let buf = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (c: string) => { buf += c; });
      process.stdin.on('end', () => resolve(buf));
      process.stdin.on('error', reject);
    });
  }
  return '';
}