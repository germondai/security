import * as p from '@clack/prompts';
import pc from 'picocolors';
import {
  hashSha, hmacSign, hmacVerify,
  aesGcmEncrypt, aesGcmDecrypt,
  rsaGenerateKeyPair, ed25519GenerateKeyPair, ecdsaGenerateKeyPair,
  toBase64, fromBase64, toBase64Url, fromBase64Url,
  toBase32, fromBase32, toBase32Hex, fromBase32Hex,
  toBase58, fromBase58, toHex, fromHex,
  toBinary, fromBinary, toOctal, fromOctal, toDecimal, fromDecimal,
} from '@germondai/security';

/** Tiny helper that prompts until the user gives a valid integer in [min, max]. */
async function promptInt(
  message: string,
  opts: { min: number; max: number; default?: number },
): Promise<number | symbol> {
  const def = String(opts.default ?? '');
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

async function promptText(message: string, opts: { placeholder?: string; required?: boolean } = {}): Promise<string | symbol> {
  const v = await p.text({
    message,
    ...(opts.placeholder ? { placeholder: opts.placeholder } : {}),
    validate: (raw) => (opts.required && String(raw).length === 0 ? 'Required' : undefined),
  });
  return v;
}

// ──────────────────────────────────────────────────────────────────────────────
// Hashes
// ──────────────────────────────────────────────────────────────────────────────

export async function shaWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' SHA Hash ')));

  const alg = await p.select({
    message: 'Algorithm',
    options: [
      { value: 'sha256', label: 'SHA-256 (recommended)' },
      { value: 'sha1',   label: 'SHA-1   (legacy)' },
      { value: 'sha384', label: 'SHA-384' },
      { value: 'sha512', label: 'SHA-512' },
    ],
  });
  if (p.isCancel(alg)) return p.cancel('Cancelled.');

  const input = await promptText('Input text', { required: true });
  if (p.isCancel(input)) return p.cancel('Cancelled.');

  const useSalt = await p.confirm({ message: 'Add a salt?', initialValue: false });
  if (p.isCancel(useSalt)) return p.cancel('Cancelled.');

  let salt: string | undefined;
  if (useSalt) {
    const s = await promptText('Salt', { required: true });
    if (p.isCancel(s)) return p.cancel('Cancelled.');
    salt = String(s);
  }

  const r = hashSha(String(input), alg as 'sha1' | 'sha256' | 'sha384' | 'sha512', salt);
  p.note(`${r.algorithm}: ${r.hash}${r.salt ? `  (salt: ${r.salt})` : ''}`, 'Digest');
  p.outro('Done.');
}

export async function hmacWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' HMAC ')));

  const key = await promptText('Secret key', { required: true });
  if (p.isCancel(key)) return p.cancel('Cancelled.');

  const data = await promptText('Message', { required: true });
  if (p.isCancel(data)) return p.cancel('Cancelled.');

  const sig = hmacSign(String(key), String(data), 'sha256');
  p.note(sig, 'HMAC-SHA256');

  const verifyMode = await p.confirm({ message: 'Verify against an expected signature now?', initialValue: false });
  if (p.isCancel(verifyMode)) return p.outro('Done.');
  if (verifyMode) {
    const expected = await promptText('Expected signature (hex)', { required: true });
    if (p.isCancel(expected)) return p.cancel('Cancelled.');
    const ok = hmacVerify(String(key), String(data), String(expected), 'sha256');
    p.note(ok ? pc.green('Valid') : pc.red('Mismatch'), 'Verify');
  }
  p.outro('Done.');
}

// ──────────────────────────────────────────────────────────────────────────────
// Ciphers
// ──────────────────────────────────────────────────────────────────────────────

export async function aesWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' AES-256-GCM ')));

  const mode = await p.select({
    message: 'Mode',
    options: [
      { value: 'enc', label: 'Encrypt' },
      { value: 'dec', label: 'Decrypt' },
    ],
  });
  if (p.isCancel(mode)) return p.cancel('Cancelled.');

  const key = await promptText('Passphrase', { required: true });
  if (p.isCancel(key)) return p.cancel('Cancelled.');

  if (mode === 'enc') {
    const plain = await promptText('Plaintext', { required: true });
    if (p.isCancel(plain)) return p.cancel('Cancelled.');
    try {
      const r = aesGcmEncrypt(String(plain), { key: String(key), outputEncoding: 'base64' });
      const bundle = JSON.stringify({ ciphertext: r.ciphertext, iv: r.iv, authTag: r.authTag, algorithm: r.algorithm }, null, 2);
      p.note(bundle, 'Encrypted bundle (base64)');
    } catch (e) {
      p.log.error(String(e instanceof Error ? e.message : e));
    }
  } else {
    const iv = await promptText('IV (hex)', { required: true });
    if (p.isCancel(iv)) return p.cancel('Cancelled.');
    const tag = await promptText('Auth tag (hex)', { required: true });
    if (p.isCancel(tag)) return p.cancel('Cancelled.');
    const ct = await promptText('Ciphertext (base64)', { required: true });
    if (p.isCancel(ct)) return p.cancel('Cancelled.');
    try {
      const plain = aesGcmDecrypt({ key: String(key), iv: String(iv), authTag: String(tag), ciphertext: String(ct), encoding: 'base64' });
      p.note(plain, 'Decrypted plaintext');
    } catch (e) {
      p.log.error(String(e instanceof Error ? e.message : e));
    }
  }
  p.outro('Done.');
}

export async function keyPairWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Key Pair Generator ')));

  const kind = await p.select({
    message: 'Algorithm',
    options: [
      { value: 'ed25519', label: 'Ed25519 (recommended - fast, small signatures)' },
      { value: 'ecdsa',   label: 'ECDSA (NIST P-256 / P-384 / P-521)' },
      { value: 'rsa',     label: 'RSA 2048 / 3072 / 4096 (slow)' },
    ],
  });
  if (p.isCancel(kind)) return p.cancel('Cancelled.');

  let curve: 'P-256' | 'P-384' | 'P-521' | null = null;
  let rsaSize: 2048 | 3072 | 4096 | null = null;
  if (kind === 'ecdsa') {
    const c = await p.select({
      message: 'Curve',
      options: [
        { value: 'P-256', label: 'P-256 (recommended)' },
        { value: 'P-384', label: 'P-384' },
        { value: 'P-521', label: 'P-521' },
      ],
    });
    if (p.isCancel(c)) return p.cancel('Cancelled.');
    curve = c as 'P-256' | 'P-384' | 'P-521';
  } else if (kind === 'rsa') {
    const size = await promptInt('Key size (bits)', { min: 2048, max: 4096, default: 2048 });
    if (p.isCancel(size)) return p.cancel('Cancelled.');
    rsaSize = size as 2048 | 3072 | 4096;
  }

  const s = p.spinner();
  s.start('Generating key pair');
  try {
    let kp: { publicKey: string; privateKey: string };
    if (kind === 'ed25519')      kp = ed25519GenerateKeyPair();
    else if (kind === 'ecdsa')   kp = ecdsaGenerateKeyPair(curve!);
    else                         kp = rsaGenerateKeyPair(rsaSize!);
    s.stop('Done');
    p.note(`-----BEGIN PUBLIC KEY-----\n${truncate(kp.publicKey, 320)}\n-----END PUBLIC KEY-----`, 'Public key (PEM, SPKI)');
    p.note(`-----BEGIN PRIVATE KEY-----\n${truncate(kp.privateKey, 320)}\n-----END PRIVATE KEY-----`, 'Private key (PEM, PKCS8)');
  } catch (e) {
    s.stop('Failed');
    p.log.error(String(e instanceof Error ? e.message : e));
  }
  p.outro('Done.');
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max)}\n... (truncated)`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Encoders
// ──────────────────────────────────────────────────────────────────────────────

const ENC_FORMATS = ['base64', 'base64url', 'base32', 'base32hex', 'base58', 'hex', 'binary', 'octal', 'decimal'] as const;
type EncFmt = typeof ENC_FORMATS[number];

function encodeText(text: string, fmt: EncFmt): string {
  const b = new TextEncoder().encode(text);
  switch (fmt) {
    case 'base64':    return toBase64(b);
    case 'base64url': return toBase64Url(b);
    case 'base32':    return toBase32(b);
    case 'base32hex': return toBase32Hex(b);
    case 'base58':    return toBase58(b);
    case 'hex':       return toHex(b);
    case 'binary':    return toBinary(b);
    case 'octal':     return toOctal(b);
    case 'decimal':   return toDecimal(b);
  }
}

function decodeText(text: string, fmt: EncFmt): string {
  let b: Uint8Array;
  switch (fmt) {
    case 'base64':    b = fromBase64(text); break;
    case 'base64url': b = fromBase64Url(text); break;
    case 'base32':    b = fromBase32(text); break;
    case 'base32hex': b = fromBase32Hex(text); break;
    case 'base58':    b = fromBase58(text); break;
    case 'hex':       b = fromHex(text); break;
    case 'binary':    b = fromBinary(text); break;
    case 'octal':     b = fromOctal(text); break;
    case 'decimal':   b = fromDecimal(text); break;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(b);
}

export async function encodeWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Encoder ')));

  const fmt = await p.select({
    message: 'Target encoding',
    options: ENC_FORMATS.map((v) => ({ value: v, label: v })),
  });
  if (p.isCancel(fmt)) return p.cancel('Cancelled.');

  const input = await promptText('Text to encode', { required: true });
  if (p.isCancel(input)) return p.cancel('Cancelled.');

  try {
    const out = encodeText(String(input), fmt as EncFmt);
    p.note(out, `${fmt}`);
  } catch (e) {
    p.log.error(String(e instanceof Error ? e.message : e));
  }
  p.outro('Done.');
}

export async function decodeWizard(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(' Decoder ')));

  const fmt = await p.select({
    message: 'Source encoding',
    options: ENC_FORMATS.map((v) => ({ value: v, label: v })),
  });
  if (p.isCancel(fmt)) return p.cancel('Cancelled.');

  const input = await promptText('Encoded text', { required: true });
  if (p.isCancel(input)) return p.cancel('Cancelled.');

  try {
    const out = decodeText(String(input), fmt as EncFmt);
    p.note(out, `${fmt} -> text`);
  } catch (e) {
    p.log.error(String(e instanceof Error ? e.message : e));
  }
  p.outro('Done.');
}