import { fileURLToPath, URL } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      // stream required: crypto-browserify's Hash extends stream.Transform
      // util excluded: promisify shim is broken in newer Vite versions
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
