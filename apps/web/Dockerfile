# syntax=docker/dockerfile:1.7
#
# Dockerfile for @germondai/security-web (apps/web).
#
# Build context: the monorepo ROOT (not apps/web), because the Vite build
# resolves workspace packages (@germondai/security, @germondai/tsconfig).
#
#   docker build -t germondai/security-web -f apps/web/Dockerfile .
#
# Or from inside apps/web:
#
#   docker build -t germondai/security-web -f Dockerfile ../..
#

# ---------- Stage 1: build ----------
FROM oven/bun:1.3.14-alpine AS builder

WORKDIR /repo

# Copy workspace manifests first for layer caching.
COPY package.json bun.lock bunfig.toml turbo.json ./
COPY packages/tsconfig/package.json          ./packages/tsconfig/package.json
COPY packages/security/package.json          ./packages/security/package.json
COPY apps/web/package.json                   ./apps/web/package.json

# Install all workspace deps (frozen lockfile for reproducible builds).
RUN bun install --frozen-lockfile

# Copy the sources needed for the web build.
COPY packages/tsconfig   ./packages/tsconfig
COPY packages/security   ./packages/security
COPY apps/web            ./apps/web

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
