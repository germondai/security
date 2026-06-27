<h1 align="center">
  <a href="https://security.germondai.com" target="_blank">
    <img align="center" src="https://icons.germondai.com/icons?i=bun,vue,vitejs,typescript" /><br/><br/>
    <span>Germond's Security</span>
  </a>
</h1>

<p align="center">
  <em>Open-source cryptography toolkit — generate, hash, encrypt, analyze. All local. Nothing ever leaves your machine.</em>
</p>

<p align="center">
  <a href="https://github.com/germondai/security/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/github/license/germondai/security?style=flat-square&color=blue" /></a>
  <a href="https://github.com/germondai/security/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/germondai/security/ci.yml?style=flat-square&label=ci" /></a>
  <a href="https://github.com/germondai/security/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/germondai/security?style=flat-square" /></a>
  <a href="https://github.com/germondai/security/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues/germondai/security?style=flat-square" /></a>
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vue.js&logoColor=white" />
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.3-f9f1e1?style=flat-square&logo=bun&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white" />
</p>

## **Welcome** to <a href="https://security.germondai.com" target="_blank">**Germond's Security**</a>! 👋

A **local-first, stateless cryptography toolkit** with a Vue 3 web app, a Node/Bun CLI called `gsec`, and a shared TypeScript core (`@germondai/security`). Every operation runs against `node:crypto` in your process — no network, no telemetry, no stored secrets. Refresh the page and the analyzer forgets.

- 🛡️ **Privacy by default** — the only `localStorage` key is the theme toggle. No accounts, no history, no cloud sync.
- 🔍 **Transparent** — the CLI and the web share one core library, so the web is a thin UI over the exact code you can run from your terminal.
- 🪪 **FOSS** — MIT licensed. Issues, PRs, and security reports welcome.

---

## ✨ Features

### 🔐 Generators

- **Password** — presets (Memorable / Standard / Maximum), length 4–128, batch up to 20, ambiguous-char exclusion, "require each class" mode.
- **Passphrase** — Diceware-style, 2–32 words, custom separator, optional appended digits, live entropy estimate.
- **Secret / API Key** — 8–64 random bytes in hex / base64 / base64url, or prefixed API keys (`sk_live_…`, `ghp_…`, `better-auth_…`).
- **ID** — UUID (v1/v3/v4/v5/v7), CUID, Nano ID (length 1–64), ULID, KSUID. Bulk up to 50.

### 🧮 Hashes

- **SHA family** — SHA-1, SHA-256, SHA-384, SHA-512, SHA-3 variants, BLAKE2 — plus `bcrypt`, `scrypt`, and `argon2id` in the core library.

### 🔒 Ciphers

- **AES-256-GCM** — passphrase-derived key, JSON output bundle (`ciphertext`, `iv`, `authTag`, `algorithm`).
- **JWT Signer** — HS256/384/512, RS256/384/512, PS256/384/512, ES256/384/512, EdDSA.
- **Key Pair Generator** — RSA (2048/3072/4096), Ed25519, ECDSA (P-256/384/521), with PEM SPKI / PKCS8 output.

### 🔁 Encoders

- **Universal Converter** — base64, base64url, base32, base32hex, base58, hex, binary, octal, decimal — both directions.

### 🧠 Analyzers

- **Password Strength** — entropy, 0–4 score, five crack-time scenarios (online throttled/unthrottled, offline slow/fast/GPU), pattern detection, suggestions.

---

## 🚀 Try it

- **Web:** <https://security.germondai.com> — runs entirely in your browser, no server roundtrip.
- **CLI:** `bunx gsec` drops you into an interactive wizard (powered by `@clack/prompts`).
- **Library:** `bun add @germondai/security` and use the same code from your own app (when published).

### CLI quick start

```bash
# Generate a 24-character password with every class
bunx gsec gen password --length 24

# Generate a 6-word passphrase with digits
bunx gsec gen passphrase --words 6 --digits

# Generate a UUID v7
bunx gsec gen uuid --version 7

# SHA-256 a string
bunx gsec hash sha256 "hello world"

# AES-256-GCM encrypt stdin
echo "secret message" | bunx gsec enc aes --passphrase "$(openssl rand -hex 32)"

# Base64 encode / decode
bunx gsec encode base64 <<< "hello"
bunx gsec decode base64 <<< "aGVsbG8="

# Password strength analyzer
bunx gsec analyze password "correct horse battery staple"
```

Run `bunx gsec --help` for the full command list.

### Use the core library

```ts
import {
  generatePassword,
  hashSha256,
  aesGcmEncrypt,
  analyzePassword,
} from "@germondai/security";

const password = generatePassword({ length: 24, symbols: true });
const digest = hashSha256("hello");
const bundle = aesGcmEncrypt({
  passphrase: "correct horse battery staple",
  plaintext: "hi",
});
const report = analyzePassword("correct horse battery staple");
```

> All functions are pure — no I/O, no persistence, no globals beyond `node:crypto`.

---

## 🛠️ Local development

Requires [Bun](https://bun.sh) ≥ 1.3 and Node ≥ 20 LTS (for the polyfilled `node:crypto` in the browser).

```bash
git clone https://github.com/germondai/security.git
cd security
bun install

bun run dev          # turbo runs every workspace in parallel (web + cli)
bun run web          # web only (Vite dev server on :5173)
bun run cli          # build core + cli, then run `gsec`

bun run build        # build every workspace
bun run typecheck    # vue-tsc + tsc --noEmit across workspaces
bun run test         # bun test in packages/security

bun run lint         # biome lint
bun run format       # biome format --write
bun run check        # biome check (lint + format dry-run)
bun run fix          # biome check --write (lint + format apply)
```

## 📦 Project layout

```
.
├── apps/
│   ├── cli/        # @germondai/security-cli — Node/Bun CLI (`gsec`)
│   └── web/        # @germondai/security-web — Vue 3 + Vite SPA
└── packages/
    ├── security/   # @germondai/security — stateless core crypto library
    └── tsconfig/   # @germondai/tsconfig — shared TypeScript presets
```

The web app reads `@germondai/security` straight from its TypeScript source via a Vite alias (`apps/web/vite.config.ts`) — there is no build step between them. This keeps a single source of truth: every primitive used in the browser is the same code `gsec` runs from your terminal.

## 🧱 Stack

| Layer    | Choice                                                           |
| -------- | ---------------------------------------------------------------- |
| Runtime  | Bun 1.3 · Node ≥ 20 LTS                                          |
| Build    | Turborepo 2.10 · Vite 8 · `vue-tsc` · `tsc`                      |
| Frontend | Vue 3.5 (Composition API) · Vue Router 5 · Tailwind 4            |
| Crypto   | `node:crypto` only (polyfilled via `vite-plugin-node-polyfills`) |
| CLI      | Citty · `@clack/prompts`                                         |
| Lint/fmt | Biome 2.5                                                        |
| Language | TypeScript 6                                                     |

## 🔐 Security

This project wraps `node:crypto`. It does not invent primitives. If you find a deviation from a standard primitive (wrong IV size, biased RNG output, broken padding, etc.), please **do not open a public issue** — follow the coordinated disclosure process in [`SECURITY.md`](./SECURITY.md).

## 🤝 Contributing

PRs and issues are welcome. Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) first — it covers the dev workflow, commit conventions (Conventional Commits, scope = workspace), and how to add yourself to contributors. By participating, you agree to abide by the [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## 📝 License

[MIT](./LICENSE) © 2026 Germond.

---

<p align="center">
    <span>Made with ❤️ by</span>
    <a href="https://github.com/germondai" target="_blank">@germondai</a>
</p>
