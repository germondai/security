# syntax=docker/dockerfile:1.7
#
# Dockerfile for @germondai/security-web (apps/web).
#
# Build context = the monorepo ROOT (this file's parent directory). BuildKit
# sandboxes the context, so `..` paths in COPY are rejected — keep the context
# at the repo root so all workspace packages are reachable.
#
#   docker build -t germondai/security-web -f Dockerfile .
#   docker run --rm -p 8080:80 germondai/security-web
#
# The repo-root .dockerignore keeps the context small (no node_modules,
# no dist, no .git, no .env). apps/cli is intentionally kept in the context
# so `bun install --frozen-lockfile` matches the lockfile (which records every
# workspace). Only apps/web/dist is shipped into the final image.

# ---------- Stage 1: build ----------
FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /repo

# Copy workspace manifests + lockfile + turbo config first.
# Layer caches well: only re-runs install when any of these change.
COPY package.json bun.lock bunfig.toml turbo.json ./
COPY packages/tsconfig/package.json          ./packages/tsconfig/package.json
COPY packages/security/package.json          ./packages/security/package.json
COPY apps/web/package.json                   ./apps/web/package.json
COPY apps/cli/package.json                   ./apps/cli/package.json

# Copy all workspace sources. The lockfile records every workspace, so every
# workspace directory must exist on disk for `bun install --frozen-lockfile`
# to validate. Only apps/web is actually built and shipped to stage 2.
COPY packages/tsconfig   ./packages/tsconfig
COPY packages/security   ./packages/security
COPY apps/web            ./apps/web
COPY apps/cli            ./apps/cli

# Install all workspace deps (frozen lockfile for reproducible builds).
RUN bun install --frozen-lockfile

# Build only the web app (turbo runs the dependency graph: tsconfig -> security -> web).
RUN bun run web:build

# ---------- Stage 2: serve ----------
FROM nginx:1.27-alpine AS runner

# Drop default config and ship a tight one tuned for an SPA.
RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Static assets built in stage 1.
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

# nginx:alpine already runs as the unprivileged `nginx` user on port 80.
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
