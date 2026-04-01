import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  passwordWizard, uuidWizard, passphraseWizard, secretWizard,
} from './generators.js';
import {
  diceWizard, colorWizard, networkWizard, cipherTextWizard,
} from './generatorsExtra.js';

/** Run a wizard wrapped in try/catch so any thrown error is shown cleanly
 *  instead of bubbling out of runWizard and crashing the CLI. */
async function safe(name: string, fn: () => Promise<void>): Promise<void> {
  try { await fn(); }
  catch (e) {
    p.log.error(`${name} wizard failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export async function runWizard(): Promise<void> {
  p.intro(pc.bgMagenta(' gsec '));

  const top = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'generators', label: 'Generators' },
      { value: 'analyzers',  label: 'Analyzers' },
      { value: 'quit',       label: 'Quit' },
    ],
  });
  if (p.isCancel(top) || top === 'quit') return p.outro('Bye!');

  if (top === 'generators') {
    const sub = await p.select({
      message: 'Pick a generator',
      options: [
        { value: 'password',    label: 'Password' },
        { value: 'passphrase',  label: 'Passphrase' },
        { value: 'uuid',        label: 'UUID / CUID / Nano ID / ULID / KSUID' },
        { value: 'secret',      label: 'Secret / API key' },
        { value: 'dice',        label: 'Dice / random integer' },
        { value: 'color',       label: 'Color (hex / rgb / hsl)' },
        { value: 'network',     label: 'Network (port / IP / MAC)' },
        { value: 'cipher-text', label: 'Text cipher (ROT13 / Caesar)' },
      ],
    });
    if (p.isCancel(sub)) return p.outro('Bye!');
    switch (sub) {
      case 'password':    await safe('Password',    passwordWizard);    break;
      case 'passphrase':  await safe('Passphrase',  passphraseWizard);  break;
      case 'uuid':        await safe('UUID',        uuidWizard);        break;
      case 'secret':      await safe('Secret',      secretWizard);      break;
      case 'dice':        await safe('Dice',        diceWizard);        break;
      case 'color':       await safe('Color',       colorWizard);       break;
      case 'network':     await safe('Network',     networkWizard);     break;
      case 'cipher-text': await safe('Cipher text', cipherTextWizard);  break;
    }
  } else if (top === 'analyzers') {
    p.log.warn('Analyzers are not yet exposed in the wizard - use `gsec analyze --input <text>`.');
  }

  p.outro('Done.');
}