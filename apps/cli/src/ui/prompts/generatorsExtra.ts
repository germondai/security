import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  rollDiceMany, randomInt,
  randomColor, randomPleasantColor,
  randomPort, randomPrivateIPv4, randomMac,
  caesar, rot13,
} from '@germondai/security';

/** Tiny helper that prompts until the user gives a valid integer in [min, max]. */
async function promptInt(
  message: string,
  opts: { min: number; max: number; initial?: number; default?: number },
): Promise<number | symbol> {
  const def = String(opts.initial ?? opts.default ?? '');
  const v = await p.text({
    message,
    placeholder: def,
    initialValue: def,
    validate: (raw) => {
      const n = Number.parseInt(String(raw), 10);
      if (!Number.isInteger(n) || n < opts.min || n > opts.max) {
        return `Must be an integer in [${opts.min}, ${opts.max}]`;
      }
      return undefined;
    },
  });
  if (p.isCancel(v)) return v;
  return Number.parseInt(String(v), 10);
}

export async function diceWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Dice ')));

  const mode = await p.select({
    message: 'Pick a mode',
    options: [
      { value: 'dice',   label: 'Roll dice (e.g. 3d20)' },
      { value: 'int',    label: 'Random integer in a range' },
      { value: 'cancel', label: 'Cancel' },
    ],
  });
  if (p.isCancel(mode) || mode === 'cancel') return p.cancel('Cancelled.');

  if (mode === 'int') {
    const lo = await promptInt('Lower bound (inclusive)', { min: -1_000_000_000, max: 1_000_000_000 });
    if (p.isCancel(lo)) return p.cancel('Cancelled.');
    const hi = await promptInt('Upper bound (inclusive)', { min: lo as number, max: 1_000_000_000 });
    if (p.isCancel(hi)) return p.cancel('Cancelled.');
    const out = randomInt(lo as number, hi as number);
    p.note(String(out), 'Result');
    p.outro('Done.');
    return;
  }

  const sides = await promptInt('Number of sides', { min: 2, max: 10000, default: 6 });
  if (p.isCancel(sides)) return p.cancel('Cancelled.');
  const count = await promptInt('How many rolls', { min: 1, max: 10000, default: 1 });
  if (p.isCancel(count)) return p.cancel('Cancelled.');

  const rolls = rollDiceMany(count as number, sides as number);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const formatted = count === 1 ? String(rolls[0]) : `${rolls.join(' ')}  (sum: ${sum})`;
  p.note(formatted, `d${sides} x ${count}`);
  p.outro('Done.');
}

export async function colorWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Color ')));

  const style = await p.select({
    message: 'Palette',
    options: [
      { value: 'random',   label: 'Random (any RGB)' },
      { value: 'pleasant', label: 'Pleasant (limited saturation/lightness)' },
    ],
  });
  if (p.isCancel(style)) return p.cancel('Cancelled.');

  const count = await promptInt('How many', { min: 1, max: 1000, default: 1 });
  if (p.isCancel(count)) return p.cancel('Cancelled.');

  const format = await p.select({
    message: 'Output format',
    options: [
      { value: 'all',  label: 'hex + rgb + hsl (human-readable)' },
      { value: 'hex',  label: 'hex only' },
      { value: 'rgb',  label: 'rgb(...)' },
      { value: 'hsl',  label: 'hsl(...)' },
      { value: 'json', label: 'JSON' },
    ],
  });
  if (p.isCancel(format)) return p.cancel('Cancelled.');

  const lines: string[] = [];
  for (let i = 0; i < (count as number); i++) {
    const c = style === 'pleasant' ? randomPleasantColor() : randomColor();
    if (format === 'hex')        lines.push(c.hex);
    else if (format === 'rgb')   lines.push(`rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`);
    else if (format === 'hsl')   lines.push(`hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`);
    else if (format === 'json')  lines.push(JSON.stringify(c));
    else                          lines.push(`${c.hex}  rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})  hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`);
  }
  p.note(lines.join('\n'), 'Colors');
  p.outro('Done.');
}

export async function networkWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Network ')));

  const kind = await p.select({
    message: 'What to generate',
    options: [
      { value: 'port', label: 'TCP/UDP port (1024-65535)' },
      { value: 'ip',   label: 'Private IPv4 (10.x.x.x)' },
      { value: 'mac',  label: 'MAC address (locally administered)' },
      { value: 'all',  label: 'All three' },
    ],
  });
  if (p.isCancel(kind)) return p.cancel('Cancelled.');

  const count = await promptInt('How many', { min: 1, max: 1000, default: 1 });
  if (p.isCancel(count)) return p.cancel('Cancelled.');

  const lines: string[] = [];
  for (let i = 0; i < (count as number); i++) {
    const bits: string[] = [];
    if (kind === 'port' || kind === 'all') bits.push(`port=${randomPort()}`);
    if (kind === 'ip'   || kind === 'all') bits.push(`ip=${randomPrivateIPv4()}`);
    if (kind === 'mac'  || kind === 'all') bits.push(`mac=${randomMac()}`);
    lines.push(bits.join('  '));
  }
  p.note(lines.join('\n'), 'Network');
  p.outro('Done.');
}

export async function cipherTextWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Text cipher ')));

  const cipher = await p.select({
    message: 'Cipher',
    options: [
      { value: 'rot13',  label: 'ROT13' },
      { value: 'caesar', label: 'Caesar (custom shift)' },
    ],
  });
  if (p.isCancel(cipher)) return p.cancel('Cancelled.');

  let shift = 13;
  if (cipher === 'caesar') {
    const s = await promptInt('Shift (-100..100)', { min: -100, max: 100, default: 3 });
    if (p.isCancel(s)) return p.cancel('Cancelled.');
    shift = s as number;
  }

  const input = await p.text({
    message: 'Text to encrypt',
    placeholder: 'Hello World',
    validate: (v) => (String(v).length === 0 ? 'Required' : undefined),
  });
  if (p.isCancel(input)) return p.cancel('Cancelled.');

  const out = cipher === 'rot13' ? rot13(String(input)) : caesar(String(input), shift);
  p.note(out, cipher === 'rot13' ? 'ROT13' : `Caesar +${shift}`);
  p.outro('Done.');
}