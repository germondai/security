<script setup lang="ts">
import { RouterLink } from "vue-router";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";

const emit = defineEmits<(e: "navigate") => void>();
function onNavigate() {
  emit("navigate");
}

interface Item {
  to: string;
  label: string;
}
interface Group {
  label: string;
  items: Item[];
}

const groups: Group[] = [
  { label: "Overview", items: [{ to: "/", label: "Home" }] },
  {
    label: "Generators",
    items: [
      { to: "/generators/password", label: "Password" },
      { to: "/generators/passphrase", label: "Passphrase" },
      { to: "/generators/secret", label: "Secret / API key" },
      { to: "/generators/id", label: "IDs (UUID / CUID / ULID…)" },
    ],
  },
  {
    label: "Analyzers",
    items: [{ to: "/analyzers/password-strength", label: "Password strength" }],
  },
  {
    label: "Hashes",
    items: [{ to: "/hashes", label: "SHA-1/256/384/512" }],
  },
  {
    label: "Ciphers",
    items: [
      { to: "/ciphers/aes", label: "AES-256-GCM" },
      { to: "/ciphers/jwt", label: "JWT (HS256)" },
      { to: "/ciphers/key", label: "Key pairs" },
    ],
  },
  {
    label: "Encoders",
    items: [{ to: "/encoders", label: "Universal converter" }],
  },
];
</script>

<template>
  <aside
    class="flex h-full w-72 flex-col gap-5 border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4"
  >
    <!-- Brand row: the link to home wraps ONLY the brand mark+title; the
         theme toggle sits next to it as a sibling so its click doesn't
         navigate. -->
    <div class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5">
      <RouterLink
        to="/"
        @click="onNavigate"
        class="flex flex-1 items-center gap-2.5 rounded-md px-1 py-0.5 hover:bg-[rgb(var(--bg))]"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-[rgb(var(--accent))]"
          aria-hidden="true"
        >
          <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <div class="flex flex-col leading-tight">
          <span class="text-[0.98rem] font-bold tracking-tight text-[rgb(var(--fg))]"
            >Germond's Security</span
          >
          <span class="text-[0.65rem] text-[rgb(var(--fg-faint))]">cryptography toolkit</span>
        </div>
      </RouterLink>
      <ThemeToggle />
    </div>

    <nav class="flex flex-1 flex-col gap-4 overflow-y-auto">
      <div v-for="g in groups" :key="g.label" class="flex flex-col gap-1">
        <p
          class="px-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgb(var(--fg-faint))]"
        >
          {{ g.label }}
        </p>
        <RouterLink
          v-for="i in g.items"
          :key="i.label"
          :to="i.to"
          @click="onNavigate"
          class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[0.88rem] text-[rgb(var(--fg))] transition hover:bg-[rgb(var(--bg))]"
          active-class="!bg-[rgb(var(--bg))] text-[rgb(var(--accent))] font-semibold"
        >
          <span class="text-[rgb(var(--fg-faint))]">›</span>
          <span>{{ i.label }}</span>
        </RouterLink>
      </div>
    </nav>

    <div
      class="border-t border-[rgb(var(--border))] pt-3 text-[0.78rem] leading-relaxed text-[rgb(var(--fg-muted))] text-center"
    >
      Made by
      <a
        href="https://github.com/germondai"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold"
        >@germondai</a
      >
    </div>
  </aside>
</template>
