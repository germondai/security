// Vue 3 SFC module shim.
// Vite 8 no longer ships a built-in `*.vue` declaration in vite/client, so
// `vue-tsc` cannot resolve `import App from './App.vue'` (TS2307) in clean
// environments such as CI or Docker. This shim is the canonical fix.
//
// Local IDEs (VS Code + Volar) usually paper over this by writing generated
// augmentations into node_modules/.vue-global-types/, which is why the build
// can appear to work on a developer machine but fail in a fresh container.
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}
