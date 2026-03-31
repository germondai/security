import { defineCommand } from 'citty';
import { jwtSign, jwtVerify } from '@germondai/security';
import { readInput } from '../utils/input.js';
import { printError, printRaw, printRawJson } from '../ui/output.js';

const signLeaf = defineCommand({
  meta: { name: 'sign', description: 'Sign a JWT (HS256).' },
  args: {
    secret:     { type: 'string', required: true, description: 'HMAC secret.' },
    payload:    { type: 'string', required: true, description: 'JSON payload (file or string).' },
    'expires-in':{ type: 'string', description: 'Lifetime in seconds.' },
    issuer:     { type: 'string', description: 'iss claim.' },
    audience:   { type: 'string', description: 'aud claim.' },
    subject:    { type: 'string', description: 'sub claim.' },
  },
  run({ args }) {
    try {
      const payloadText = readInput(args['payload'] as string | undefined);
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const opts: Parameters<typeof jwtSign>[0] = {
        algorithm: 'HS256', secret: args['secret'] as string, payload,
      };
      if (args['expires-in']) opts.expiresIn = Number.parseInt(args['expires-in'] as string, 10);
      if (args['issuer'])     opts.issuer   = args['issuer']   as string;
      if (args['audience'])   opts.audience = args['audience'] as string;
      if (args['subject'])    opts.subject  = args['subject']  as string;
      printRaw(jwtSign(opts));
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

const verifyLeaf = defineCommand({
  meta: { name: 'verify', description: 'Verify a JWT (HS256).' },
  args: {
    token:      { type: 'string', required: true, description: 'JWT to verify.' },
    secret:     { type: 'string', required: true, description: 'HMAC secret.' },
    issuer:     { type: 'string', description: 'Expected iss.' },
    audience:   { type: 'string', description: 'Expected aud.' },
  },
  run({ args }) {
    try {
      const opts: Parameters<typeof jwtVerify>[0] = {
        token: args['token'] as string,
        secret: args['secret'] as string,
      };
      if (args['issuer'])   opts.issuer   = args['issuer']   as string;
      if (args['audience']) opts.audience = args['audience'] as string;
      const r = jwtVerify(opts);
      printRawJson(r);
      if (!r.valid) process.exitCode = 1;
    } catch (e) { printError(String(e)); process.exitCode = 1; }
  },
});

export const jwtCmd = defineCommand({
  meta: { name: 'jwt', description: 'Sign and verify JSON Web Tokens (HS256).' },
  subCommands: { sign: signLeaf, verify: verifyLeaf },
});
