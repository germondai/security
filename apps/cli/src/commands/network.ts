import { defineCommand } from 'citty';
import { randomPort, randomPrivateIPv4, randomMac } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const networkLeaf = defineCommand({
  meta: { name: 'network', description: 'Generate random ports, private IPs, and MAC addresses.' },
  args: {
    kind:  { type: 'string', shortAlias: 'k', default: 'port', description: 'port | ip | mac | all' },
    count: { type: 'string', default: '1',    description: 'How many (1-1000).' },
  },
  run({ args }) {
    try {
      const kind = (args['kind'] ?? 'port') as 'port' | 'ip' | 'mac' | 'all';
      const count = Number.parseInt(args['count'] ?? '1', 10);
      if (!Number.isInteger(count) || count < 1 || count > 1000) {
        printError('--count must be in [1, 1000]');
        process.exitCode = 64;
        return;
      }
      if (!['port', 'ip', 'mac', 'all'].includes(kind)) {
        printError('--kind must be one of port | ip | mac | all');
        process.exitCode = 64;
        return;
      }
      const lines: string[] = [];
      for (let i = 0; i < count; i++) {
        const bits: string[] = [];
        if (kind === 'port' || kind === 'all') bits.push(`port=${randomPort()}`);
        if (kind === 'ip'   || kind === 'all') bits.push(`ip=${randomPrivateIPv4()}`);
        if (kind === 'mac'  || kind === 'all') bits.push(`mac=${randomMac()}`);
        lines.push(bits.join('  '));
      }
      printRaw(lines.join('\n'));
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});