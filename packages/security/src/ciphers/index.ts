import { createCipheriv, createDecipheriv, randomBytes, createHash, generateKeyPairSync, createPublicKey, createPrivateKey, sign as _sign, verify as _verify } from 'node:crypto';

/** Wrap raw DER bytes as a PEM string (the format produced by node:crypto's
 *  publicKeyEncoding/privateKeyEncoding with `format: 'pem'`). Used by the
 *  WebCrypto async variants of the key generators so they return PEM too,
 *  matching what the sync versions produce. */
function pemWrap(label: string, der: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < der.length; i++) bin += String.fromCharCode(der[i] ?? 0);
  const b64 = typeof btoa === 'function' ? btoa(bin) : Buffer.from(der).toString('base64');
  const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

export interface AesEncryptOptions {
  key: string;
  iv?: string;
  aad?: string;
  inputEncoding?: 'utf8' | 'base64' | 'hex';
  outputEncoding: 'base64' | 'hex';
}

export interface CipherResult {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: 'aes-256-gcm';
  encoding: 'base64' | 'hex';
}

const hasWebCrypto = typeof globalThis !== 'undefined'
  && typeof (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle !== 'undefined';

function asBytes(s: string, enc: 'utf8' | 'base64' | 'hex' | undefined): Uint8Array {
  if (enc === 'base64') {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  if (enc === 'hex') {
    const out = new Uint8Array(s.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
    return out;
  }
  return new TextEncoder().encode(s);
}

function bytesToHex(b: ArrayBuffer | Uint8Array): string {
  const arr = b instanceof Uint8Array ? b : new Uint8Array(b);
  let out = '';
  for (let i = 0; i < arr.length; i++) out += (arr[i] ?? 0).toString(16).padStart(2, '0');
  return out;
}

function deriveKeyBytes(passphrase: string): Uint8Array {
  // SHA-256(passphrase) → 32 bytes. Same in Node and browser.
  return createHash('sha256').update(passphrase, 'utf8').digest();
}

/** AES-256-GCM encrypt. Works in Node (createCipheriv) and browser (WebCrypto). */
export async function aesGcmEncryptAsync(plaintext: string, opts: AesEncryptOptions): Promise<CipherResult> {
  const keyBytes = deriveKeyBytes(opts.key);
  const iv = opts.iv ? asBytes(opts.iv, 'hex') : randomBytes(12);
  const ptBytes = asBytes(plaintext, opts.inputEncoding ?? 'utf8');

  if (hasWebCrypto) {
    const subtle = (globalThis as { crypto: { subtle: SubtleCrypto } }).crypto.subtle;
    const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
    const params: { name: 'AES-GCM'; iv: Uint8Array; additionalData?: Uint8Array } = { name: 'AES-GCM', iv };
    if (opts.aad) params.additionalData = asBytes(opts.aad, 'utf8');
    const ct = await subtle.encrypt(params, cryptoKey, ptBytes);
    // ct = ciphertext || tag (last 16 bytes)
    const ctArr = new Uint8Array(ct);
    const ciphertext = ctArr.slice(0, ctArr.length - 16);
    const tag = ctArr.slice(ctArr.length - 16);
    return {
      ciphertext: opts.outputEncoding === 'hex' ? bytesToHex(ciphertext) : btoa(String.fromCharCode(...ciphertext)),
      iv: bytesToHex(iv),
      authTag: bytesToHex(tag),
      algorithm: 'aes-256-gcm',
      encoding: opts.outputEncoding,
    };
  }
  // Node fallback
  const cipher = createCipheriv('aes-256-gcm', keyBytes, iv);
  if (opts.aad) cipher.setAAD(Buffer.from(opts.aad, 'utf8'));
  const enc = cipher.update(Buffer.from(ptBytes));
  const fin = cipher.final();
  const tag = cipher.getAuthTag();
  const ct = Buffer.concat([enc, fin]);
  return {
    ciphertext: opts.outputEncoding === 'hex' ? ct.toString('hex') : ct.toString('base64'),
    iv: Buffer.from(iv).toString('hex'),
    authTag: Buffer.from(tag).toString('hex'),
    algorithm: 'aes-256-gcm',
    encoding: opts.outputEncoding,
  };
}

export interface AesDecryptOptions {
  key: string;
  iv: string;
  authTag: string;
  ciphertext: string;
  aad?: string;
  encoding: 'base64' | 'hex';
}

export async function aesGcmDecryptAsync(opts: AesDecryptOptions): Promise<string> {
  const keyBytes = deriveKeyBytes(opts.key);
  const iv = asBytes(opts.iv, 'hex');
  const tag = asBytes(opts.authTag, 'hex');
  let ctBytes = asBytes(opts.ciphertext, opts.encoding);
  // Combine ciphertext + tag for WebCrypto
  const combined = new Uint8Array(ctBytes.length + tag.length);
  combined.set(ctBytes, 0);
  combined.set(tag, ctBytes.length);

  if (hasWebCrypto) {
    const subtle = (globalThis as { crypto: { subtle: SubtleCrypto } }).crypto.subtle;
    const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
    const params: { name: 'AES-GCM'; iv: Uint8Array; additionalData?: Uint8Array } = { name: 'AES-GCM', iv };
    if (opts.aad) params.additionalData = asBytes(opts.aad, 'utf8');
    const pt = await subtle.decrypt(params, cryptoKey, combined);
    return new TextDecoder().decode(pt);
  }
  const decipher = createDecipheriv('aes-256-gcm', keyBytes, iv);
  decipher.setAuthTag(Buffer.from(tag));
  if (opts.aad) decipher.setAAD(Buffer.from(opts.aad, 'utf8'));
  const dec = Buffer.concat([decipher.update(Buffer.from(ctBytes)), decipher.final()]);
  return dec.toString('utf8');
}

// Sync Node-only versions (kept for backwards compat with CLI)
function deriveKey(passphrase: string): Buffer {
  return createHash('sha256').update(passphrase, 'utf8').digest().subarray(0, 32);
}
function asNodeBytes(s: string, enc: 'utf8' | 'base64' | 'hex' | undefined): Buffer {
  if (enc === 'base64') return Buffer.from(s, 'base64');
  if (enc === 'hex') return Buffer.from(s, 'hex');
  return Buffer.from(s, 'utf8');
}
export function aesGcmEncrypt(plaintext: string, opts: AesEncryptOptions): CipherResult {
  const key = deriveKey(opts.key);
  const iv = opts.iv ? asNodeBytes(opts.iv, 'hex') : randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  if (opts.aad) cipher.setAAD(Buffer.from(opts.aad, 'utf8'));
  const enc = cipher.update(plaintext, opts.inputEncoding ?? 'utf8') as Buffer;
  const fin = cipher.final();
  const tag = cipher.getAuthTag();
  const ct = Buffer.concat([enc, fin]);
  return {
    ciphertext: opts.outputEncoding === 'hex' ? ct.toString('hex') : ct.toString('base64'),
    iv: iv.toString('hex'),
    authTag: tag.toString('hex'),
    algorithm: 'aes-256-gcm',
    encoding: opts.outputEncoding,
  };
}
export function aesGcmDecrypt(opts: AesDecryptOptions): string {
  const key = deriveKey(opts.key);
  const iv = asNodeBytes(opts.iv, 'hex');
  const tag = asNodeBytes(opts.authTag, 'hex');
  const ct = asNodeBytes(opts.ciphertext, opts.encoding);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  if (opts.aad) decipher.setAAD(Buffer.from(opts.aad, 'utf8'));
  const dec = decipher.update(ct) as Buffer;
  const fin = decipher.final();
  return Buffer.concat([dec, fin]).toString('utf8');
}

export function rsaGenerateKeyPair(keySize: 2048 | 3072 | 4096 = 2048): { publicKey: string; privateKey: string; keySize: number } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding:  { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey, keySize };
}

/** Async variant of rsaGenerateKeyPair — uses WebCrypto in the browser so
 *  it works in web bundles, and node:crypto in Node. Always returns PEM. */
export async function rsaGenerateKeyPairAsync(keySize: 2048 | 3072 | 4096 = 2048): Promise<{ publicKey: string; privateKey: string; keySize: number }> {
  if (typeof (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle === 'undefined') {
    return rsaGenerateKeyPair(keySize);
  }
  const subtle = (globalThis as { crypto: { subtle: SubtleCrypto } }).crypto.subtle;
  const kp = await subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify'],
  ) as CryptoKeyPair;
  const [spki, pkcs8] = await Promise.all([
    subtle.exportKey('spki',  kp.publicKey),
    subtle.exportKey('pkcs8', kp.privateKey),
  ]);
  return {
    publicKey:  pemWrap('PUBLIC KEY',  new Uint8Array(spki)),
    privateKey: pemWrap('PRIVATE KEY', new Uint8Array(pkcs8)),
    keySize,
  };
}
export function rsaSign(privateKeyPem: string, data: string, alg: 'sha256' | 'sha384' | 'sha512' = 'sha256'): string {
  return _sign(`rsa-${alg}`, Buffer.from(data, 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}
export function rsaVerify(publicKeyPem: string, data: string, signatureB64: string, alg: 'sha256' | 'sha384' | 'sha512' = 'sha256'): boolean {
  return _verify(`rsa-${alg}`, Buffer.from(data, 'utf8'), createPublicKey(publicKeyPem), Buffer.from(signatureB64, 'base64'));
}
export function ed25519GenerateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding:  { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

/** Async variant of ed25519GenerateKeyPair. WebCrypto support for Ed25519 is
 *  spotty (Chrome 113+, Safari 17+, Firefox 130+), so we fall back to the
 *  sync node:crypto variant when the browser does not expose it. */
export async function ed25519GenerateKeyPairAsync(): Promise<{ publicKey: string; privateKey: string }> {
  const subtle = (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle;
  if (!subtle) return ed25519GenerateKeyPair();
  try {
    const kp = await subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']) as CryptoKeyPair;
    const [spki, pkcs8] = await Promise.all([
      subtle.exportKey('spki',  kp.publicKey),
      subtle.exportKey('pkcs8', kp.privateKey),
    ]);
    return {
      publicKey:  pemWrap('PUBLIC KEY',  new Uint8Array(spki)),
      privateKey: pemWrap('PRIVATE KEY', new Uint8Array(pkcs8)),
    };
  } catch {
    return ed25519GenerateKeyPair();
  }
}
export function ed25519Sign(privateKeyPem: string, data: string): string {
  return _sign(null, Buffer.from(data, 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}
export function ed25519Verify(publicKeyPem: string, data: string, signatureB64: string): boolean {
  return _verify(null, Buffer.from(data, 'utf8'), createPublicKey(publicKeyPem), Buffer.from(signatureB64, 'base64'));
}
export function ecdsaGenerateKeyPair(curve: 'P-256' | 'P-384' | 'P-521' = 'P-256'): { publicKey: string; privateKey: string; curve: string } {
  const { publicKey, privateKey } = generateKeyPairSync('ec', {
    namedCurve: curve,
    publicKeyEncoding:  { type: 'spki',  format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey, curve };
}

/** Async variant of ecdsaGenerateKeyPair — WebCrypto supports ECDSA on all
 *  modern browsers, so this is the preferred call from the web app. */
export async function ecdsaGenerateKeyPairAsync(curve: 'P-256' | 'P-384' | 'P-521' = 'P-256'): Promise<{ publicKey: string; privateKey: string; curve: string }> {
  const subtle = (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle;
  if (!subtle) return ecdsaGenerateKeyPair(curve);
  const webAlg = curve === 'P-256' ? 'P-256' : curve === 'P-384' ? 'P-384' : 'P-521';
  const kp = await subtle.generateKey({ name: 'ECDSA', namedCurve: webAlg }, true, ['sign', 'verify']) as CryptoKeyPair;
  const [spki, pkcs8] = await Promise.all([
    subtle.exportKey('spki',  kp.publicKey),
    subtle.exportKey('pkcs8', kp.privateKey),
  ]);
  return {
    publicKey:  pemWrap('PUBLIC KEY',  new Uint8Array(spki)),
    privateKey: pemWrap('PRIVATE KEY', new Uint8Array(pkcs8)),
    curve,
  };
}
export function ecdsaSign(privateKeyPem: string, data: string, alg: 'sha256' | 'sha384' | 'sha512' = 'sha256'): string {
  return _sign(`ecdsa-${alg}`, Buffer.from(data, 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}
export function ecdsaVerify(publicKeyPem: string, data: string, signatureB64: string, alg: 'sha256' | 'sha384' | 'sha512' = 'sha256'): boolean {
  return _verify(`ecdsa-${alg}`, Buffer.from(data, 'utf8'), createPublicKey(publicKeyPem), Buffer.from(signatureB64, 'base64'));
}
