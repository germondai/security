# `@germondai/security`

Stateless security and cryptography toolkit core.

All operations are pure — no I/O, no persistence. The library is the single source of truth for every crypto operation in the `@germondai/security-monorepo` (CLI + Web). It uses `node:crypto` exclusively; the web app polyfills it via `vite-plugin-node-polyfills`.

## Modules

- `generators/` — password, passphrase, uuid, slug, secret
- `hashes/` — sha, bcrypt, scrypt, argon2id
- `ciphers/` — aes, rsa, ed25519, ecdsa
- `encoders/` — base64, base32, base58, hex, binary, octal
- `formats/` — keys (PEM/DER/JWK), jwt, wordlists
- `analyzers/` — entropy, cracktime, strength

## Development

```bash
bun test          # run unit tests
bun run typecheck # tsc --noEmit
bun run build     # tsc -p tsconfig.build.json (emits dist/)
```
