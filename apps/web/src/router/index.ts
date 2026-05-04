import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title?: string;
  }
}

const BASE = "Germond's Security";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: { title: `${BASE} — Cryptography Toolkit` },
  },
  {
    path: "/generators/password",
    name: "generators-password",
    component: () => import("@/views/generators/PasswordView.vue"),
    meta: { title: `Password Generator — ${BASE}` },
  },
  {
    path: "/generators/passphrase",
    name: "generators-passphrase",
    component: () => import("@/views/generators/PassphraseView.vue"),
    meta: { title: `Passphrase Generator — ${BASE}` },
  },
  {
    path: "/generators/secret",
    name: "generators-secret",
    component: () => import("@/views/generators/SecretView.vue"),
    meta: { title: `Secret / API Key Generator — ${BASE}` },
  },
  {
    path: "/generators/id",
    name: "generators-id",
    component: () => import("@/views/generators/UuidView.vue"),
    meta: { title: `ID Generator (UUID / CUID / ULID) — ${BASE}` },
  },
  {
    path: "/analyzers/password-strength",
    name: "analyzers-password-strength",
    component: () => import("@/views/analyzers/PasswordStrengthView.vue"),
    meta: { title: `Password Strength Analyzer — ${BASE}` },
  },
  {
    path: "/hashes",
    name: "hashes",
    component: () => import("@/views/hashes/HashView.vue"),
    meta: { title: `SHA Hash — ${BASE}` },
  },
  {
    path: "/ciphers/aes",
    name: "ciphers-aes",
    component: () => import("@/views/ciphers/AesView.vue"),
    meta: { title: `AES-256-GCM Encryption — ${BASE}` },
  },
  {
    path: "/ciphers/jwt",
    name: "ciphers-jwt",
    component: () => import("@/views/ciphers/JwtView.vue"),
    meta: { title: `JWT Signer — ${BASE}` },
  },
  {
    path: "/ciphers/key",
    name: "ciphers-key",
    component: () => import("@/views/ciphers/KeyView.vue"),
    meta: { title: `Key Pair Generator — ${BASE}` },
  },
  {
    path: "/encoders",
    name: "encoders",
    component: () => import("@/views/encoders/ConverterView.vue"),
    meta: { title: `Universal Converter — ${BASE}` },
  },
];

export const router = createRouter({ history: createWebHistory(), routes });

router.afterEach((to) => {
  document.title = (to.meta.title as string | undefined) ?? BASE;
});
