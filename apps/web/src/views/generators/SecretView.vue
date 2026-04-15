<script setup lang="ts">
import { ref, computed } from 'vue';
import { generateSecret, generateApiKey } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const bytes = ref(32);
const encoding = ref<'hex' | 'base64' | 'base64url'>('hex');
const prefix = ref('');
const seed = ref(0);

const prefixError = computed(() => /\s/.test(prefix.value) ? 'Prefix must not contain whitespace' : '');

const value = computed(() => {
  void seed.value;
  if (prefixError.value) return '— fix input above —';
  try {
    return prefix.value
      ? generateApiKey({ prefix: prefix.value, bytes: bytes.value })
      : generateSecret({ bytes: bytes.value, encoding: encoding.value });
  } catch (e) { return '// ' + (e instanceof Error ? e.message : String(e)); }
});

const bits = computed(() => bytes.value * 8);
function regenerate() { seed.value++; }

const cli = computed(() => {
  const parts = ['bun cli gen secret', `--bytes ${bytes.value}`];
  if (prefix.value) parts.push(`--prefix "${prefix.value}"`);
  else              parts.push(`--encoding ${encoding.value}`);
  return parts.join(' ');
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold">▸ Secret / API key</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Cryptographically-secure random bytes. 32 bytes = 256 bits. With prefix you get
        Stripe / GitHub / better-auth style keys (<code>sk_live_…</code>, <code>ghp_…</code>).
      </p>
    </header>

    <div class="card p-5 space-y-5">
      <div class="flex items-stretch gap-2">
        <div class="flex-1 break-all rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 font-mono text-[0.82rem]">{{ value }}</div>
        <button class="btn-icon" @click="regenerate">↻</button>
        <CopyButton :value="value" />
      </div>

      <p class="text-[0.85rem] text-[rgb(var(--fg-muted))]">
        Entropy: <span class="font-mono text-[rgb(var(--accent))]">{{ bits }} bits</span>
        <span v-if="bits < 128" class="ml-2 text-[rgb(var(--accent-2))]">— fine for non-cryptographic IDs</span>
        <span v-else class="ml-2 text-[rgb(var(--ok))]">— strong key material</span>
      </p>

      <div class="space-y-4">
        <div class="flex flex-col">
          <label class="field-label">Bytes: <span class="text-[rgb(var(--accent))]">{{ bytes }}</span></label>
          <input type="range" :min="8" :max="64" :step="1" v-model.number="bytes" class="w-full" />
        </div>
        <div class="flex flex-col">
          <label class="field-label">Encoding (when no prefix)</label>
          <div class="tab-bar">
            <button v-for="e in (['hex','base64','base64url'] as const)" :key="e"
              type="button" @click="encoding = e" :disabled="!!prefix"
              :aria-pressed="encoding === e"
              :class="{ 'is-active': encoding === e, 'opacity-50': !!prefix }">{{ e }}</button>
          </div>
        </div>
        <div class="flex flex-col">
          <label class="field-label">Prefix (no whitespace)</label>
          <input type="text" v-model="prefix" placeholder="sk_live_, ghp_, better-auth_…" class="font-mono" :class="prefixError ? '!border-[rgb(var(--danger))]' : ''" />
          <p v-if="prefixError" class="mt-1 text-[0.75rem] text-[rgb(var(--danger))]">{{ prefixError }}</p>
        </div>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
