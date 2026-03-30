import { defineCommand } from 'citty';
import { hashSha, hmacSign, hmacVerify, hashPassword, pbkdf2Hash } from '@germondai/security';
import { readInput } from '../utils/input.js';
import { printError, printRaw, printRawJson } from '../ui/output.js';

const shaLeaf = defineCommand({
  meta: { name: 'sha', description: 'Hash with SHA-1/256/384/512 (optional salt).' },
  args: {
    algorithm: { type: 'string', default: 'sha256', description: 'sha1 | sha256 | sha384 | sha512' },
    input:     { type: 'string',                     description: 'Input (string, file, or stdin).' },
    salt:      { type: 'string',                     description: 'Optional salt string.' },
  },
  run({ args }) {
    try {
      const alg = (args['algorithm'] ?? 'sha256') as 'sha1' | 'sha256' | 'sha384' | 'sha512';
      const text = readInput(args['input'] as string | undefined);
      const salt = args['salt'] as string | undefined;
      const out = hashSha(text, alg, salt);
      printRawJson(out);
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

const hmacLeaf = defineCommand({
  meta: { name: 'hmac', description: 'HMAC sign / verify (SHA-256).' },
  args: {
    action:    { type: 'string', required: true,  description: 'sign | verify' },
    key:       { type: 'string', required: true,  description: 'HMAC secret.' },
    input:     { type: 'string', required: true,  description: 'Data to sign/verify.' },
    signature: { type: 'string',                   description: 'For verify: expected signature (hex).' },
    algorithm: { type: 'string', default: 'sha256', description: 'sha1 | sha256 | sha384 | sha512' },
  },
  run({ args }) {
    try {
      const action = (args['action'] ?? 'sign') as string;
      const data = readInput(args['input'] as string | undefined);
      const key = readInput(args['key'] as string | undefined);
      const alg = (args['algorithm'] ?? 'sha256') as 'sha1' | 'sha256' | 'sha384' | 'sha512';
      if (action === 'sign') {
        printRaw(hmacSign(key, data, alg));
      } else if (action === 'verify') {
        const sig = (args['signature'] ?? '').trim();
        const ok = hmacVerify(key, data, sig, alg);
        printRawJson({ valid: ok });
        if (!ok) process.exitCode = 1;
      } else {
        printError('--action must be sign or verify');
        process.exitCode = 64;
      }
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

const passwordLeaf = defineCommand({
  meta: { name: 'password', description: 'Hash a password with scrypt or pbkdf2.' },
  args: {
    input:     { type: 'string',                     description: 'Password (string, file, or stdin).' },
    algorithm: { type: 'string', default: 'scrypt',  description: 'scrypt | pbkdf2' },
    cost:      { type: 'string', default: '16384',   description: 'scrypt N / pbkdf2 iterations.' },
    'salt-bytes': { type: 'string', default: '16',  description: 'Salt length in bytes.' },
  },
  async run({ args }) {
    try {
      const pwd = readInput(args['input'] as string | undefined);
      const algo = (args['algorithm'] ?? 'scrypt') as 'scrypt' | 'pbkdf2';
      const saltBytes = Number.parseInt(args['salt-bytes'] ?? '16', 10);
      if (algo === 'scrypt') {
        const N = Number.parseInt(args['cost'] ?? '16384', 10);
        const out = await hashPassword(pwd, { cost: N, saltBytes });
        printRawJson(out);
      } else {
        const iters = Number.parseInt(args['cost'] ?? '100000', 10);
        const out = await pbkdf2Hash(pwd, { iterations: iters, saltBytes });
        printRawJson(out);
      }
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

export const hash = defineCommand({
  meta: { name: 'hash', description: 'Hash utilities (SHA, HMAC, password hashing).' },
  subCommands: { sha: shaLeaf, hmac: hmacLeaf, password: passwordLeaf },
});
