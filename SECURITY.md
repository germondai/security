# Security Policy

Thanks for helping keep **Germond's Security** — and its users — safe. 🔐

This document explains how to report a vulnerability, what we promise in return, and the project's current scope of support.

## ⚠️ Do not open a public issue for security bugs

Public issues are indexed by search engines, scrapers, and AI crawlers within minutes. If you have a security concern, **do not file it as a public GitHub issue.**

## 📣 How to report a vulnerability

Use **one** of these private channels (in order of preference):

1. **GitHub private vulnerability reporting** (recommended):
   <https://github.com/germondai/security/security/advisories/new>

   This opens a private thread only the maintainer can see, supports patches, and produces a CVE if needed.

2. **Direct email:** `security@<your-domain>` *(replace `<your-domain>` with the domain listed in the repo's GitHub profile once the address is live)*. Encrypt at your discretion — the maintainer can receive GPG if you ask.

3. **Direct message:** contact [@germondai](https://github.com/germondai) on GitHub and ask for an encrypted channel.

## 📝 What to include

A good report speeds triage. Please include:

- **Affected version / commit SHA** (`git rev-parse HEAD` from your clone).
- **Affected component** (web app, CLI, or core library — and which file/module).
- **Reproduction steps** — minimal code, command, or URL that triggers the bug.
- **Impact** — what can an attacker do? Is data leaked, integrity broken, or service denied?
- **Environment** — Bun / Node version, OS, browser (for web issues).
- **(Optional) Suggested fix** — patches are welcome but not required.

## ⏱️ Response SLA

| Stage              | Target                                                    |
| ------------------ | --------------------------------------------------------- |
| Acknowledgement    | within **72 hours** of the report                         |
| Triage / severity  | within **7 days**                                         |
| Fix / mitigation   | depends on severity; critical issues are prioritized      |
| Public disclosure  | coordinated with the reporter; default **90 days**        |

If we cannot reproduce or don't believe the report is in scope, we will say so plainly.

## 🧭 Scope

### In scope

- Anything in this repository (`apps/`, `packages/`) that diverges from a
  standard cryptographic primitive or a reasonable expectation of security.
  Examples: wrong IV size for AES-GCM, biased RNG output, broken padding,
  JWT `alg: none` bypass, timing-side-channel regressions, output of secrets
  to logs, persistent storage of secrets we said we wouldn't store.

- The web build, if it changes behavior in a way that exfiltrates data,
  weakens entropy, or persists data the user wouldn't expect.

### Out of scope

- Bugs that require the user to install malicious dependencies themselves.
- Issues in upstream `node:crypto` / WebCrypto — please report those to the
  Node.js / browser teams instead.
- Social engineering, phishing, or attacks that require physical access.
- Theoretical attacks against algorithms we use but did not implement
  (e.g., weaknesses in SHA-256 itself).

## ✅ Supported versions

The project is currently **pre-1.0** (`0.0.0` across every workspace). Only the
latest commit on the default branch receives security fixes.

| Version  | Supported          |
| -------- | ------------------ |
| `main`   | ✅                  |
| `dev`    | ✅                  |
| older    | ❌ — please upgrade |

Once we ship `1.0`, this table will expand to cover the latest minor release
and the previous minor release (standard LTS window).

## 🪪 Cryptographic scope note

This project wraps **`node:crypto`** and adds no primitives of its own. The web
build polyfills `node:crypto` via `vite-plugin-node-polyfills`. Any deviation
from a documented standard primitive is a bug — please report it.

## 🙏 Thanks

Security research is volunteer work. We appreciate reports that are clear,
reproducible, and respectful of users who depend on this toolkit.
