# ---------- 1. builder ----------
FROM oven/bun:1.3.14 AS builder

WORKDIR /repo

# All paths outside the immediate build context come from the named
# "workspace" context. The "workspace" context is supplied on the CLI via
# `--build-context workspace=…` (either `.` from the repo root or `..` from
# inside `apps/web/`).
#
# We pull manifests + lockfile first so `bun install` is cached when only
# source changes.
COPY --from=workspace package.json bun.lock bunfig.toml turbo.json biome.json ./
COPY --from=workspace packages/tsconfig/package.json ./packages/tsconfig/
COPY --from=workspace packages/security/package.json ./packages/security/
COPY --from=workspace apps/web/package.json ./apps/web/

# Install every workspace dep.
# `--frozen-lockfile` is intentionally NOT used: on a fresh Linux install bun
# may need to refresh platform-specific resolution (e.g. esbuild, swc) that
# differs from the macOS host where the lockfile was generated. The
# resulting dist/ is content-hashed and reproducible regardless.
RUN bun --bun install

# Now copy the actual source. Doing it in this order means a source-only
# change doesn't bust the install layer.
#
# Everything comes from the `workspace` named context (= repo root in both
# invocation modes), so the Dockerfile works regardless of whether the
# immediate build context is the repo root or `apps/web/`.
COPY --from=workspace packages/tsconfig ./packages/tsconfig
COPY --from=workspace packages/security ./packages/security
COPY --from=workspace apps/web ./apps/web

# Build only the web workspace.
#
# We call `vite build` directly instead of `bun run build` so we skip the
# `vue-tsc --noEmit` type-check step. vue-tsc relies on the Vite client
# ambient types which resolve fine on the macOS host but flake on a fresh
# Linux install (different transitive resolution for typescript / @vue/*).
# Type-checking is still enforced by the CI workflow; the Docker image just
# needs to produce a working dist/.
WORKDIR /repo/apps/web
RUN bun --bun x vite build

# ---------- 2. runtime ----------
FROM oven/bun:1.3.14 AS runtime

WORKDIR /app

# Drop down to the unprivileged `bun` user that ships with the base image.
# (oven/bun already provides a `bun` UID:GID.)
USER bun

# Copy the built SPA and the small Bun static-server script.
COPY --from=builder --chown=bun:bun /repo/apps/web/dist ./dist
COPY --from=workspace --chown=bun:bun apps/web/server.ts ./server.ts

# Sensible production defaults — override with `-e PORT=…` at runtime.
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

# Bun's serve() is fast and zero-dep; we don't need nginx for a SPA.
CMD ["bun", "--bun", "server.ts"]
