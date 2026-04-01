import { defineCommand, runMain } from 'citty';
import { registerCommands } from './commands/index.js';
import { runWizard } from './ui/prompts/router.js';

export async function run(): Promise<void> {
  if (process.argv.length <= 2) {
    await runWizard();
    return;
  }
  const root = defineCommand({
    meta: {
      name: 'gsec',
      version: '0.0.0',
      description: 'Stateless security & cryptography toolkit.',
    },
    subCommands: registerCommands(),
  });
  await runMain(root);
}
