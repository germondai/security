import { Buffer } from 'node:buffer';

const ENC = new TextEncoder();
const DEC = new TextDecoder('utf-8', { fatal: true });

export const utf8Encode = (s: string): Uint8Array => ENC.encode(s);
export const utf8Decode = (b: Uint8Array): string => DEC.decode(b);
export const toBase64 = (b: Uint8Array): string => Buffer.from(b).toString('base64');
export const fromBase64 = (s: string): Uint8Array => new Uint8Array(Buffer.from(s, 'base64'));

export const toBase64Url = (b: Uint8Array): string =>
  Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

export const fromBase64Url = (s: string): Uint8Array => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const std = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return new Uint8Array(Buffer.from(std, 'base64'));
};
