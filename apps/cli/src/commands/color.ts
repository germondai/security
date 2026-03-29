import { defineCommand } from 'citty';
import { randomColor, randomPleasantColor, type Color } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

function fmt(c: Color, format: 'all' | 'hex' | 'rgb' | 'hsl' | 'json'): string {
  if (format === 'json') return JSON.stringify(c, null, 2);
  if (format === 'hex')  return c.hex;
  if (format === 'rgb')  return `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`;
  if (format === 'hsl')  return `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`;
  return `${c.hex}  rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})  hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`;
}

export const colorLeaf = defineCommand({
  meta: { name: 'color', description: 'Generate random colors (hex / rgb / hsl).' },
  args: {
    count:    { type: 'string',  default: '1',  description: 'How many (1-1000).' },
    pleasant: { type: 'boolean',                              description: 'Constrain saturation/lightness for a pleasant palette.' },
    format:   { type: 'string',  shortAlias: 'f', default: 'all', description: 'all | hex | rgb | hsl | json' },
  },
  run({ args }) {
    try {
      const count = Number.parseInt(args['count'] ?? '1', 10);
      if (!Number.isInteger(count) || count < 1 || count > 1000) {
        printError('--count must be in [1, 1000]');
        process.exitCode = 64;
        return;
      }
      const format = (args['format'] ?? 'all') as 'all' | 'hex' | 'rgb' | 'hsl' | 'json';
      if (!['all', 'hex', 'rgb', 'hsl', 'json'].includes(format)) {
        printError('--format must be one of all | hex | rgb | hsl | json');
        process.exitCode = 64;
        return;
      }
      const out: string[] = [];
      for (let i = 0; i < count; i++) {
        const c = args['pleasant'] ? randomPleasantColor() : randomColor();
        out.push(fmt(c, format));
      }
      printRaw(out.join('\n'));
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});