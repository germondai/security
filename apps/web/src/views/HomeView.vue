<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const heroCmd = ref('bun cli gen password --length 32');
const heroCmdCopied = ref(false);

async function copyHeroCmd() {
  try {
    await navigator.clipboard.writeText(heroCmd.value);
    heroCmdCopied.value = true;
    setTimeout(() => (heroCmdCopied.value = false), 1500);
  } catch { /* clipboard unavailable */ }
}

const tools = [
  { to: '/generators/password',          icon: '◈', name: 'Password',           desc: 'Cryptographically random. All charset classes.' },
  { to: '/generators/passphrase',        icon: '◇', name: 'Passphrase',         desc: 'Diceware-style. 5 words ≈ 50 bits of entropy.' },
  { to: '/generators/secret',            icon: '◉', name: 'Secret / API key',   desc: 'Raw random bytes in hex / base64 / base64url.' },
  { to: '/generators/id',                icon: '◍', name: 'UUID v1-v7, CUID…',  desc: 'RFC 4122 + ULID, KSUID, Nano ID. Bulk up to 50.' },
  { to: '/analyzers/password-strength',  icon: '▣', name: 'Password strength',  desc: 'Entropy, patterns, time-to-crack scenarios.' },
  { to: '/hashes',                       icon: '⬡', name: 'Hash (SHA)',         desc: 'SHA-1, SHA-256, SHA-384, SHA-512 + salt.' },
  { to: '/ciphers/aes',                  icon: '⬢', name: 'AES-256-GCM',        desc: 'Authenticated encryption, passphrase-derived key.' },
  { to: '/ciphers/jwt',                  icon: '⬣', name: 'JWT (HS256)',        desc: 'Sign and verify JSON Web Tokens.' },
  { to: '/ciphers/key',                  icon: '◆', name: 'Key pairs',          desc: 'RSA, Ed25519, ECDSA. PEM output, in-browser.' },
  { to: '/encoders',                     icon: '⬚', name: 'Universal converter',desc: 'base64 / base32 / base58 / hex / binary / …' },
];

const stats = [
  { v: '10+',     label: 'cryptographic primitives' },
  { v: '1 core',  label: 'TypeScript library shared by CLI & Web' },
  { v: '0 bytes', label: 'saved anywhere — fully stateless' },
  { v: '<3 KB',   label: 'minified core, tree-shaken per view' },
];

const cliExamples = [
  '$ bun cli gen password --length 24',
  '$ bun cli gen passphrase --words 6 --capitalize',
  '$ bun cli gen secret --bytes 32 --encoding base64url',
  '$ bun cli gen uuid --kind uuid --version v5 --name "gsec"',
  '$ bun cli hash sha --algorithm sha256 --input "hello"',
  '$ bun cli gen dice --count 5 --sides 20',
  '$ bun cli gen color --pleasant --format hex',
  '$ bun cli gen network --kind all',
  '$ bun cli gen cipher-text --cipher rot13 --input "gsec"',
  '$ bun cli                                       # bare invocation → @clack wizard',
];
</script>

<template>
  <div class="space-y-16">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--accent-soft))] via-[rgb(var(--bg))] to-[rgb(var(--bg))] p-8 sm:p-12">
      <div class="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[rgb(var(--accent))] opacity-[0.08] blur-3xl"></div>
      <div class="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-[rgb(var(--ok))] opacity-[0.06] blur-3xl"></div>

      <div class="relative space-y-6 text-center sm:text-left">
        <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span class="pill pill-accent">stateless</span>
          <span class="pill pill-accent">user-owned</span>
          <span class="pill">cli + web</span>
          <span class="pill">zero telemetry</span>
          <span class="pill">node:crypto</span>
        </div>

        <h1 class="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Generate, hash, encrypt, analyze.
          <span class="block bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--ok))] bg-clip-text text-transparent">
            Nothing ever leaves your machine.
          </span>
        </h1>

        <p class="mx-auto max-w-2xl text-[1.02rem] leading-relaxed text-[rgb(var(--fg-muted))] sm:mx-0">
          <strong class="text-[rgb(var(--fg))]">gsec</strong> is a single-purpose toolkit for the things you
          reach for in a hurry: a strong password, a passphrase, a JWT, a quick check whether
          that candidate password would survive a real attack. One pure-TypeScript core,
          shared by the <code>gsec</code> CLI and this web app.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2 sm:justify-start">
          <RouterLink to="/generators/password" class="btn btn-accent">
            <span>Generate a password</span>
            <span aria-hidden="true">→</span>
          </RouterLink>
          <RouterLink to="/analyzers/password-strength" class="btn">Check a password</RouterLink>
          <button
            type="button"
            class="btn btn-ghost font-mono text-[0.82rem]"
            :title="heroCmdCopied ? 'Copied!' : 'Click to copy'"
            @click="copyHeroCmd"
          >
            <span aria-hidden="true">{{ heroCmdCopied ? '✓' : '$' }}</span>
            <span>{{ heroCmd }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Stats strip -->
    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="card p-4 text-center">
        <div class="text-2xl font-bold text-[rgb(var(--accent))]">{{ s.v }}</div>
        <div class="mt-1 text-[0.78rem] text-[rgb(var(--fg-muted))]">{{ s.label }}</div>
      </div>
    </section>

    <!-- Tool grid -->
    <section class="space-y-4">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 class="text-2xl font-bold whitespace-nowrap">All tools</h2>
        <span class="text-[0.85rem] text-[rgb(var(--fg-muted))] whitespace-nowrap">{{ tools.length }} generators, analyzers, hashes, ciphers</span>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="t in tools"
          :key="t.name"
          :to="t.to"
          class="card group flex flex-col gap-2 p-4 transition hover:border-[rgb(var(--accent))] hover:shadow-md"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl text-[rgb(var(--accent))]">{{ t.icon }}</span>
            <h3 class="text-base font-semibold text-[rgb(var(--fg))]">{{ t.name }}</h3>
            <span aria-hidden="true" class="ml-auto text-[rgb(var(--fg-faint))] transition group-hover:translate-x-0.5 group-hover:text-[rgb(var(--accent))]">→</span>
          </div>
          <p class="text-[0.85rem] leading-relaxed text-[rgb(var(--fg-muted))]">{{ t.desc }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- CLI quickstart -->
    <section class="space-y-3">
      <div class="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <h2 class="text-2xl font-bold whitespace-nowrap">CLI quickstart</h2>
        <span class="text-[0.85rem] text-[rgb(var(--fg-muted))] whitespace-nowrap">every tool also lives on the command line</span>
      </div>
      <div class="card overflow-hidden">
        <div class="flex items-center gap-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-2.5 text-[0.78rem] text-[rgb(var(--fg-muted))]">
          <span class="h-2.5 w-2.5 rounded-full bg-[rgb(var(--danger))]"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-[rgb(var(--warn))]"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-[rgb(var(--ok))]"></span>
          <span class="ml-2 font-mono">~/projects/gsec — zsh</span>
          <span class="ml-auto font-mono">bun &gt;= 1.1</span>
        </div>
        <pre class="m-0 overflow-x-auto bg-transparent p-4 text-[0.82rem] leading-relaxed text-[rgb(var(--fg))]"><code>{{ cliExamples.join('\n') }}</code></pre>
      </div>
    </section>

    <!-- Principles -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card p-5">
        <div class="text-2xl text-[rgb(var(--accent))]">▸</div>
        <h3 class="mt-2 text-base font-semibold">Stateless</h3>
        <p class="mt-1 text-[0.85rem] leading-relaxed text-[rgb(var(--fg-muted))]">No accounts, no history, no localStorage of secrets. Refresh the page and the analyzer forgets.</p>
      </div>
      <div class="card p-5">
        <div class="text-2xl text-[rgb(var(--accent))]">▸</div>
        <h3 class="mt-2 text-base font-semibold">User-owned output</h3>
        <p class="mt-1 text-[0.85rem] leading-relaxed text-[rgb(var(--fg-muted))]">Every result is yours to copy, pipe, or ignore. There is no "cloud sync" because there is no cloud.</p>
      </div>
      <div class="card p-5">
        <div class="text-2xl text-[rgb(var(--accent))]">▸</div>
        <h3 class="mt-2 text-base font-semibold">One crypto source</h3>
        <p class="mt-1 text-[0.85rem] leading-relaxed text-[rgb(var(--fg-muted))]">Both surfaces call the same <code>@germondai/security</code> package. No platform-specific code paths.</p>
      </div>
      <div class="card p-5">
        <div class="text-2xl text-[rgb(var(--accent))]">▸</div>
        <h3 class="mt-2 text-base font-semibold">Bun + Node</h3>
        <p class="mt-1 text-[0.85rem] leading-relaxed text-[rgb(var(--fg-muted))]">Fast installs and tests in dev. The published <code>gsec</code> binary runs on any Node ≥ 20 LTS.</p>
      </div>
    </section>
  </div>
</template>