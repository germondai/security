import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      // crypto-browserify's Hash extends a stream.Transform; without `stream`
      // the constructor throws "Cannot read properties of undefined
      // (reading 'call')" when .update() is called. The util promisify
      // shim is broken in newer Vite versions, so we still exclude `util`.
      include: ["crypto", "buffer", "stream"],
      exclude: ["util"],
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@germondai/security": fileURLToPath(
        new URL("../../packages/security/src/index.ts", import.meta.url),
      ),
    },
  },
  optimizeDeps: { include: ["node:crypto"] },
  server: { port: 5173 },
});
