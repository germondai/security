import { defineCommand } from 'citty';
import { generateUuid, generateUuids, generateCuid, generateNanoId, generateUlid, generateKsuid, type UuidVersion } from '@germondai/security';
import { printError, printRaw } from '../ui/output.js';

export const uuidLeaf = defineCommand({
  meta: { name: 'uuid', description: 'Generate IDs: UUID v1/v3/v4/v5/v7, CUID, Nano ID, ULID, KSUID.' },
  args: {
    kind:      { type: 'string', default: 'uuid', description: 'uuid | cuid | nanoid | ulid | ksuid' },
    version:   { type: 'string', default: 'v4',    description: 'For uuid: v1 | v3 | v4 | v5 | v7' },
    count:     { type: 'string', default: '1',     description: 'How many (1-1000).' },
    upper:     { type: 'boolean',                   description: 'Uppercase output (UUID only).' },
    name:      { type: 'string',                    description: 'For v3/v5: the name to hash.' },
    namespace: { type: 'string',                    description: 'For v3/v5: namespace UUID.' },
    size:      { type: 'string', default: '21',    description: 'For nanoid: length (default 21).' },
  },
  run({ args }) {
    try {
      const kind = (args['kind'] ?? 'uuid') as string;
      const n = Number.parseInt(args['count'] ?? '1', 10);
      if (!Number.isInteger(n) || n < 1 || n > 1000) { printError('--count must be in [1, 1000]'); process.exitCode = 64; return; }
      let out: string[];
      if (kind === 'cuid')       out = Array.from({ length: n }, () => generateCuid(24));
      else if (kind === 'nanoid') {
        const size = Number.parseInt(args['size'] ?? '21', 10);
        out = Array.from({ length: n }, () => generateNanoId(size));
      }
      else if (kind === 'ulid')  out = Array.from({ length: n }, () => generateUlid());
      else if (kind === 'ksuid') out = Array.from({ length: n }, () => generateKsuid());
      else {
        const opts: Parameters<typeof generateUuids>[1] = { version: (args['version'] ?? 'v4') as UuidVersion };
        if (args['upper']) opts.case = 'upper';
        if (opts.version === 'v3' || opts.version === 'v5') {
          if (args['name']) opts.name = args['name'] as string;
          if (args['namespace']) opts.namespace = args['namespace'] as string;
        }
        out = generateUuids(n, opts);
      }
      printRaw(out.join('\n'));
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});
