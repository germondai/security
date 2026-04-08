import { createPublicKey, createPrivateKey, createHmac } from 'node:crypto';
import { toBase64Url, fromBase64Url } from '../internal/encoding.js';

export function pemToJwk(pem: string, kind: 'public' | 'private'): Record<string, unknown> {
  const key = kind === 'public' ? createPublicKey(pem) : createPrivateKey(pem);
  return key.export({ format: 'jwk' }) as Record<string, unknown>;
}

export function jwkToPem(jwk: Record<string, unknown>, kind: 'public' | 'private'): string {
  const key = kind === 'public'
    ? createPublicKey({ key: jwk, format: 'jwk' })
    : createPrivateKey({ key: jwk, format: 'jwk' });
  return key.export({ type: kind === 'public' ? 'spki' : 'pkcs8', format: 'pem' }) as string;
}

export function pemToDer(pem: string, kind: 'public' | 'private'): Buffer {
  const key = kind === 'public' ? createPublicKey(pem) : createPrivateKey(pem);
  return key.export({ type: kind === 'public' ? 'spki' : 'pkcs8', format: 'der' }) as Buffer;
}

export function derToPem(derB64: string, kind: 'public' | 'private'): string {
  const buf = Buffer.from(derB64, 'base64');
  const key = kind === 'public'
    ? createPublicKey({ key: buf, format: 'der', type: 'spki' })
    : createPrivateKey({ key: buf, format: 'der', type: 'pkcs8' });
  return key.export({ type: kind === 'public' ? 'spki' : 'pkcs8', format: 'pem' }) as string;
}

export interface JwtSignOptions {
  algorithm: 'HS256';
  secret: string;
  payload: Record<string, unknown>;
  header?: Record<string, unknown>;
  expiresIn?: number;
  notBefore?: number;
  issuer?: string;
  audience?: string;
  jwtid?: string;
  subject?: string;
}

export interface JwtVerifyResult {
  valid: boolean;
  payload?: Record<string, unknown>;
  header?: Record<string, unknown>;
  error?: string;
  expiresAt?: Date;
  issuedAt?: Date;
}

function b64u(data: string): string {
  return toBase64Url(new TextEncoder().encode(data));
}

export function jwtSign(opts: JwtSignOptions): string {
  const now = Math.floor(Date.now() / 1000);
  const header: Record<string, unknown> = { alg: 'HS256', typ: 'JWT', ...opts.header };
  const payload: Record<string, unknown> = { ...opts.payload };
  if (opts.subject)  payload['sub'] = opts.subject;
  if (opts.issuer)   payload['iss'] = opts.issuer;
  if (opts.audience) payload['aud'] = opts.audience;
  if (opts.jwtid)    payload['jti'] = opts.jwtid;
  payload['iat'] = now;
  if (opts.notBefore !== undefined) payload['nbf'] = opts.notBefore;
  if (opts.expiresIn !== undefined) payload['exp'] = now + opts.expiresIn;
  const headerB64 = b64u(JSON.stringify(header));
  const payloadB64 = b64u(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const sig = createHmac('sha256', opts.secret).update(signingInput, 'utf8').digest();
  return `${signingInput}.${toBase64Url(new Uint8Array(sig))}`;
}

export interface JwtVerifyOptions {
  token: string;
  secret: string;
  audience?: string;
  issuer?: string;
  clockTolerance?: number;
}

export function jwtVerify(opts: JwtVerifyOptions): JwtVerifyResult {
  const parts = opts.token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'malformed token' };
  const [h, p, s] = parts as [string, string, string];
  const expected = createHmac('sha256', opts.secret).update(`${h}.${p}`, 'utf8').digest();
  let actual: Uint8Array;
  try { actual = fromBase64Url(s); } catch { return { valid: false, error: 'invalid signature encoding' }; }
  if (expected.length !== actual.length) return { valid: false, error: 'invalid signature' };
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= (expected[i] ?? 0) ^ (actual[i] ?? 0);
  if (diff !== 0) return { valid: false, error: 'signature mismatch' };
  let header: Record<string, unknown>, payload: Record<string, unknown>;
  try {
    header  = JSON.parse(new TextDecoder().decode(fromBase64Url(h)));
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(p)));
  } catch { return { valid: false, error: 'invalid json' }; }
  if (header['alg'] !== 'HS256') return { valid: false, error: `unsupported alg: ${String(header['alg'])}` };
  const now = Math.floor(Date.now() / 1000);
  const skew = opts.clockTolerance ?? 0;
  if (typeof payload['exp'] === 'number' && now > payload['exp'] + skew) return { valid: false, header, payload, error: 'token expired', expiresAt: new Date(payload['exp'] * 1000) };
  if (typeof payload['nbf'] === 'number' && now < payload['nbf'] - skew) return { valid: false, header, payload, error: 'token not yet valid' };
  if (opts.issuer   && payload['iss'] !== opts.issuer)   return { valid: false, header, payload, error: 'issuer mismatch' };
  if (opts.audience && payload['aud'] !== opts.audience) return { valid: false, header, payload, error: 'audience mismatch' };
  const result: JwtVerifyResult = { valid: true, header, payload };
  if (typeof payload['iat'] === 'number') result.issuedAt = new Date(payload['iat'] * 1000);
  if (typeof payload['exp'] === 'number') result.expiresAt = new Date(payload['exp'] * 1000);
  return result;
}
