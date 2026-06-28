# syntax=docker/dockerfile:1.7
#
# Dockerfile for @germondai/security-web (apps/web).
#
# Build context = the monorepo ROOT.
#
#   docker build -t germondai/security-web -f Dockerfile .
#   docker run --rm -p 8080:80 germondai/security-web
#
# Uses `turbo prune --docker` to scope the build to only the workspaces
# @germondai/security-web needs (apps/web + packages/security +
# packages/tsconfig). apps/cli and every other unused workspace is filtered
# out before install runs, so bun.lock validation succeeds without apps/cli
# on disk. No apps/cli source ever enters the image.

# ---------- Stage 1: prune ----------
# Reads turbo.json + every workspace's package.json to compute the subset
# required by @germondai/security-web, then emits:
#   /repo/out/json/  — pruned package.json tree + pruned bun.lock (small)
#   /repo/out/full/  — full source tree of the pruned subset
FROM oven/bun:1.3.14-alpine AS pruner
WORKDIR /repo
COPY . .
RUN bunx turbo prune @germondai/security-web --docker

# ---------- Stage 2: install + build ----------
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /repo

# Copy the pruned manifest tree (just package.json files + pruned bun.lock).
COPY --from=pruner /repo/out/json/ .
RUN bun install --frozen-lockfile

# Copy the pruned sources on top of node_modules and run the (now tiny) turbo graph.
COPY --from=pruner /repo/out/full/ .
RUN bun run build

# ---------- Stage 3: serve ----------
FROM nginx:1.27-alpine AS runner

# Drop default config and ship a tight one tuned for an SPA.
RUN rm /etc/nginx/conf.d/default.conf
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Static assets built in stage 2.
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

# nginx:alpine already runs as the unprivileged `nginx` user on port 80.
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
