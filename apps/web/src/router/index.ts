import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
  {
    path: "/generators/password",
    name: "generators-password",
    component: () => import("@/views/generators/PasswordView.vue"),
  },
  {
    path: "/generators/passphrase",
    name: "generators-passphrase",
    component: () => import("@/views/generators/PassphraseView.vue"),
  },
  {
    path: "/generators/secret",
    name: "generators-secret",
    component: () => import("@/views/generators/SecretView.vue"),
  },
  {
    path: "/generators/id",
    name: "generators-id",
    component: () => import("@/views/generators/UuidView.vue"),
  },
  {
    path: "/analyzers/password-strength",
    name: "analyzers-password-strength",
    component: () => import("@/views/analyzers/PasswordStrengthView.vue"),
  },
  { path: "/hashes", name: "hashes", component: () => import("@/views/hashes/HashView.vue") },
  {
    path: "/ciphers/aes",
    name: "ciphers-aes",
    component: () => import("@/views/ciphers/AesView.vue"),
  },
  {
    path: "/ciphers/jwt",
    name: "ciphers-jwt",
    component: () => import("@/views/ciphers/JwtView.vue"),
  },
  {
    path: "/ciphers/key",
    name: "ciphers-key",
    component: () => import("@/views/ciphers/KeyView.vue"),
  },
  {
    path: "/encoders",
    name: "encoders",
    component: () => import("@/views/encoders/ConverterView.vue"),
  },
];

export const router = createRouter({ history: createWebHistory(), routes });
