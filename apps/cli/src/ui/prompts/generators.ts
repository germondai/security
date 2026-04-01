import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  generatePassword, type PasswordOptions,
  generateUuid, generateCuid, generateNanoId, generateUlid, generateKsuid,
  generatePassphrase, generateSecret, type SecretOptions, type UuidVersion, type UuidOptions,
} from '@germondai/security';

export async function passwordWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Password Generator ')));

  const lengthStr = await p.text({
    message: 'How long?',
    placeholder: '20',
    initialValue: '20',
    validate: (v) => {
      const n = Number.parseInt(String(v), 10);
      if (!Number.isInteger(n) || n < 1 || n > 1024) return 'Must be an integer 1-1024';
      return undefined;
    },
  });
  if (p.isCancel(lengthStr)) return p.cancel('Cancelled.');

  const lower = await p.confirm({ message: 'Include lowercase?', initialValue: true });
  if (p.isCancel(lower)) return p.cancel('Cancelled.');
  const upper = await p.confirm({ message: 'Include uppercase?', initialValue: true });
  if (p.isCancel(upper)) return p.cancel('Cancelled.');
  const digits = await p.confirm({ message: 'Include digits?',    initialValue: true });
  if (p.isCancel(digits)) return p.cancel('Cancelled.');
  const symbols = await p.confirm({ message: 'Include symbols?',  initialValue: true });
  if (p.isCancel(symbols)) return p.cancel('Cancelled.');

  const excludeAmbiguous = await p.select({
    message: 'Exclude ambiguous characters?',
    options: [
      { value: false, label: 'No, keep all' },
      { value: true,  label: "Yes, exclude 0Oo1lI|`'\"" },
    ],
    initialValue: false,
  });
  if (p.isCancel(excludeAmbiguous)) return p.cancel('Cancelled.');

  const requireEach = await p.confirm({
    message: 'Require each class at least once?',
    initialValue: false,
  });
  if (p.isCancel(requireEach)) return p.cancel('Cancelled.');

  const opts: PasswordOptions = {
    length: Number.parseInt(String(lengthStr), 10),
    lower,
    upper,
    digits,
    symbols,
    excludeAmbiguous,
    requireEach,
  };

  const s = p.spinner();
  s.start('Generating');
  let out: string;
  try {
    out = generatePassword(opts);
  } catch (e) {
    s.stop('Failed');
    p.log.error(e instanceof Error ? e.message : String(e));
    return;
  }
  s.stop('Done');

  p.note(out, 'Your password');
  p.outro('Done.');
}

export async function uuidWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' ID Generator ')));

  const kind = await p.select({
    message: 'Kind',
    options: [
      { value: 'uuid',   label: 'UUID (v1 / v3 / v4 / v5 / v7)' },
      { value: 'cuid',   label: 'CUID (24 chars, prefix c)' },
      { value: 'nanoid', label: 'Nano ID (custom length)' },
      { value: 'ulid',   label: 'ULID (26 chars, time-sortable)' },
      { value: 'ksuid',  label: 'KSUID (27 chars, time-sortable)' },
    ],
  });
  if (p.isCancel(kind)) return p.cancel('Cancelled.');

  let version: UuidVersion = 'v4';
  let name: string | undefined;
  let namespace: string | undefined;
  let size = 21;

  if (kind === 'uuid') {
    const v = await p.select({
      message: 'UUID version',
      options: [
        { value: 'v4', label: 'v4 - random (recommended)' },
        { value: 'v7', label: 'v7 - time-ordered random' },
        { value: 'v5', label: 'v5 - SHA-1 namespace hash' },
        { value: 'v3', label: 'v3 - MD5 namespace hash (deprecated)' },
        { value: 'v1', label: 'v1 - timestamp + MAC (deprecated)' },
      ],
    });
    if (p.isCancel(v)) return p.cancel('Cancelled.');
    version = v as UuidVersion;

    if (version === 'v3' || version === 'v5') {
      const n = await p.text({
        message: 'Name to hash',
        placeholder: 'example.com',
        validate: (x) => (String(x).length === 0 ? 'Required' : undefined),
      });
      if (p.isCancel(n)) return p.cancel('Cancelled.');
      name = String(n);

      const ns = await p.select({
        message: 'Namespace',
        options: [
          { value: 'dns',  label: 'DNS  (6ba7b810-9dad-11d1-80b4-00c04fd430c8)' },
          { value: 'url',  label: 'URL  (6ba7b811-9dad-11d1-80b4-00c04fd430c8)' },
          { value: 'oid',  label: 'OID  (6ba7b812-9dad-11d1-80b4-00c04fd430c8)' },
          { value: 'x500', label: 'X500 (6ba7b814-9dad-11d1-80b4-00c04fd430c8)' },
          { value: 'cust', label: 'Custom UUID' },
        ],
      });
      if (p.isCancel(ns)) return p.cancel('Cancelled.');
      if (ns === 'cust') {
        const c = await p.text({
          message: 'Custom namespace UUID',
          validate: (x) => (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(x)) ? undefined : 'Must be a valid UUID'),
        });
        if (p.isCancel(c)) return p.cancel('Cancelled.');
        namespace = String(c);
      } else {
        const NAMESPACES: Record<string, string> = {
          dns:  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          url:  '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
          oid:  '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
          x500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
        };
        namespace = NAMESPACES[ns as string];
      }
    }
  } else if (kind === 'nanoid') {
    const s = await p.text({
      message: 'Length (1-64)',
      placeholder: '21',
      initialValue: '21',
      validate: (x) => {
        const n = Number.parseInt(String(x), 10);
        return Number.isInteger(n) && n >= 1 && n <= 64 ? undefined : 'Must be an integer in [1, 64]';
      },
    });
    if (p.isCancel(s)) return p.cancel('Cancelled.');
    size = Number.parseInt(String(s), 10);
  }

  const countStr = await p.text({
    message: 'How many',
    placeholder: '1',
    initialValue: '1',
    validate: (x) => {
      const n = Number.parseInt(String(x), 10);
      return Number.isInteger(n) && n >= 1 && n <= 1000 ? undefined : 'Must be an integer in [1, 1000]';
    },
  });
  if (p.isCancel(countStr)) return p.cancel('Cancelled.');
  const count = Number.parseInt(String(countStr), 10);

  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    if (kind === 'cuid')      lines.push(generateCuid(24));
    else if (kind === 'nanoid') lines.push(generateNanoId(size));
    else if (kind === 'ulid')   lines.push(generateUlid());
    else if (kind === 'ksuid')  lines.push(generateKsuid());
    else {
      const opts: UuidOptions = { version };
      if (name) opts.name = name;
      if (namespace) opts.namespace = namespace;
      lines.push(generateUuid(opts));
    }
  }
  p.note(lines.join('\n'), `IDs (${kind}${kind === 'uuid' ? ` ${version}` : ''})`);
  p.outro('Done.');
}

export async function passphraseWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Passphrase Generator ')));

  const wordsStr = await p.text({
    message: 'How many words (2-32)',
    placeholder: '5',
    initialValue: '5',
    validate: (v) => {
      const n = Number.parseInt(String(v), 10);
      return Number.isInteger(n) && n >= 2 && n <= 32 ? undefined : 'Must be an integer in [2, 32]';
    },
  });
  if (p.isCancel(wordsStr)) return p.cancel('Cancelled.');
  const words = Number.parseInt(String(wordsStr), 10);

  const separator = await p.select({
    message: 'Separator',
    options: [
      { value: '-',    label: 'dash       (gsec-style)' },
      { value: ' ',    label: 'space      (memorable)' },
      { value: '_',    label: 'underscore (gsec_style)' },
      { value: '.',    label: 'dot        (gsec.style)' },
      { value: 'none', label: 'no separator (gsecstyle)' },
    ],
  });
  if (p.isCancel(separator)) return p.cancel('Cancelled.');

  const capitalize = await p.confirm({ message: 'Capitalize each word?', initialValue: true });
  if (p.isCancel(capitalize)) return p.cancel('Cancelled.');

  const number = await p.confirm({ message: 'Append a random digit?', initialValue: false });
  if (p.isCancel(number)) return p.cancel('Cancelled.');

  const out = generatePassphrase({
    words,
    separator: separator === 'none' ? '' : (separator as string),
    capitalize,
    includeNumber: number,
  });
  p.note(out, 'Your passphrase');
  p.outro('Done.');
}

export async function secretWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Secret / API key ')));

  const bytesStr = await p.text({
    message: 'How many random bytes (8-256)',
    placeholder: '32',
    initialValue: '32',
    validate: (v) => {
      const n = Number.parseInt(String(v), 10);
      return Number.isInteger(n) && n >= 8 && n <= 256 ? undefined : 'Must be an integer in [8, 256]';
    },
  });
  if (p.isCancel(bytesStr)) return p.cancel('Cancelled.');
  const bytes = Number.parseInt(String(bytesStr), 10);

  const encoding = await p.select({
    message: 'Encoding',
    options: [
      { value: 'hex',       label: 'hex' },
      { value: 'base64',    label: 'base64' },
      { value: 'base64url', label: 'base64url (URL-safe)' },
    ],
  });
  if (p.isCancel(encoding)) return p.cancel('Cancelled.');

  const prefix = await p.text({
    message: 'Optional prefix (e.g. sk_live_)',
    placeholder: '(none)',
    validate: (v) => /^[a-zA-Z0-9_-]*$/.test(String(v)) ? undefined : 'Only letters, digits, dash, underscore',
  });
  if (p.isCancel(prefix)) return p.cancel('Cancelled.');

  const opts: SecretOptions = { bytes, encoding: encoding as SecretOptions['encoding'] };
  if (String(prefix).length > 0) opts.prefix = String(prefix);

  const out = generateSecret(opts);
  p.note(out, `Secret (${bytes * 8} bits, ${encoding})`);
  p.outro('Done.');
}