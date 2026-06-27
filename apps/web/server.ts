/**
 * Tiny SPA-aware static file server for the production build of `@germondai/security-web`.
 *
 * - Serves `dist/` over HTTP.
 * - Falls back to `dist/index.html` for any GET that doesn't match a file,
 *   so client-side routing (Vue Router with `createWebHistory`) keeps working
 *   on hard refresh / deep links.
 * - Sets sensible cache headers: `no-cache` for `index.html`, immutable
 *   `max-age=31536000` for every other asset (Vite emits content-hashed names).
 * - Rejects path traversal attempts with 403.
 *
 * Run with: `bun --bun server.ts`
 * Env:       PORT (default 8080), HOST (default 0.0.0.0)
 */

import { file } from "bun";
import { extname, join, resolve } from "node:path";

const HOST = process.env.HOST ?? "0.0.0.0";
const PORT = Number(process.env.PORT ?? 8080);
const DIST = resolve(import.meta.dir, "dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  development: false,

  async fetch(req): Promise<Response> {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { allow: "GET, HEAD" },
      });
    }

    const url = new URL(req.url);
    const decoded = decodeURIComponent(url.pathname);

    // Reject anything that smells like a path-traversal attempt before it
    // ever reaches the filesystem.
    if (decoded.includes("..") || decoded.includes("\\")) {
      return new Response("Forbidden", { status: 403 });
    }

    const target = resolve(join(DIST, decoded));
    // Make sure the resolved path is still inside DIST/ after symlink-aware resolve.
    if (target !== DIST && !target.startsWith(DIST + "/")) {
      return new Response("Forbidden", { status: 403 });
    }

    const f = file(target);
    if (await f.exists()) {
      const stat = await f.stat();
      if (stat.isDirectory()) {
        return serveIndex();
      }

      const ext = extname(target).toLowerCase();
      const mime = MIME[ext] ?? "application/octet-stream";
      const cacheControl =
        ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable";

      const headers = new Headers({
        "content-type": mime,
        "cache-control": cacheControl,
        "x-content-type-options": "nosniff",
      });

      return new Response(req.method === "HEAD" ? null : f, { headers });
    }

    // No matching file — for SPA routes, fall through to index.html so the
    // Vue Router can take over on the client. Both GET and HEAD get the
    // fallback so probes / health-checks work.
    if (req.method === "GET" || req.method === "HEAD") {
      return serveIndex();
    }

    return new Response("Not Found", { status: 404 });
  },

  error(): Response {
    return new Response("Internal Server Error", { status: 500 });
  },
});

function serveIndex(): Response {
  const idx = file(join(DIST, "index.html"));
  return new Response(idx, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
      "x-content-type-options": "nosniff",
    },
  });
}

console.log(
  `🦊 security-web listening on http://${server.hostname}:${server.port}`,
);
