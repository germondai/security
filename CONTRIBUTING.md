# Contributing to Germond's Security

First off — thanks for taking the time to contribute. 🛡️

This project is small, MIT-licensed, and uses modern tooling (Bun + Turborepo + Biome + TypeScript). The bar for getting a PR merged is intentionally low, but a few conventions will save everyone a round trip.

> ⚠️ By participating, you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

## 🧰 Development setup

Requires [Bun](https://bun.sh) ≥ 1.3 and Node ≥ 20 LTS.

```bash
git clone https://github.com/germondai/security.git
cd security
bun install
```

### Useful scripts

| Script              | What it does                                                          |
| ------------------- | --------------------------------------------------------------------- |
| `bun run dev`       | Turbo runs every workspace in parallel (web on `:5173`, cli wizard)   |
| `bun run web`       | Web only — Vite dev server                                            |
| `bun run cli`       | Build core + cli, then run `gsec` interactively                       |
| `bun run build`     | Build every workspace                                                 |
| `bun run typecheck` | `vue-tsc` + `tsc --noEmit` across workspaces                          |
| `bun run test`      | `bun test` in `packages/security`                                     |
| `bun run lint`      | `biome lint`                                                          |
| `bun run format`    | `biome format --write`                                                |
| `bun run check`     | `biome check` (lint + format, dry run)                                |
| `bun run fix`       | `biome check --write` (applies safe fixes)                            |

## ✍️ Coding style

We use **Biome 2.5** for both lint and format — there is no ESLint or Prettier. Before opening a PR:

```bash
bun run check    # must pass
bun run typecheck
bun run test
```

CI runs the same three commands across every workspace, so a local green run means a green PR.

Configuration lives at the repo root in `biome.json`. Don't fight it — open an issue if a rule is wrong.

## 📝 Commit messages

We use **Conventional Commits**, scoped to the workspace, all lowercase. Examples from recent history:

```
feat(security): improve generators
feat(security): refine crypto core
build(web): update web build configuration
chore(build): remove generated tsbuildinfo artifacts from workspace
refactor(web): simplify security composition
```

- **Type:** `feat`, `fix`, `refactor`, `build`, `chore`, `docs`, `test`, `ci`, `perf`.
- **Scope:** the workspace name — `security`, `web`, `cli`, `build`, `tooling`. Never the change type.
- **Subject:** imperative, no trailing period, ≤ 72 chars.

Multiple commits per PR are fine when they tell a clean story; squash at merge time if the maintainer prefers.

## 🌿 Branches & pull requests

- Fork the repo and cut a branch from `dev` (or `main` for hotfixes).
- Open a PR against `dev`.
- Fill in the [PR template](./.github/PULL_REQUEST_TEMPLATE.md) — including a linked issue, screenshots for UI changes, and a checklist of the local commands you ran.
- One PR per logical change. Don't bundle a typo fix with a refactor.

### When to open an issue first

- Any non-trivial change — please. It saves us from rejecting PRs that were never going to land.
- Bug reports: always an issue first (or at the same time as the PR).
- Small fixes (typos, broken links, one-line tweaks): direct PR is fine.

## 🧪 Testing

- Unit tests live in `packages/security/test/`. Run them with `bun run test` from the repo root, or `bun test` from inside the package.
- The CLI ships smoke tests in CI (`gsec gen password …`) — see `.github/workflows/ci.yml`.
- New primitives in `packages/security/` should ship with at least one happy-path and one edge-case test.

## 🔐 Security

Found a vulnerability? **Do not open a public issue.** Follow [`SECURITY.md`](./SECURITY.md).

## 📜 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

## 🙋 Getting help

Open a [Discussion](https://github.com/germondai/security/discussions) (once enabled) or tag `@germondai` on your PR / issue. We're friendly.
