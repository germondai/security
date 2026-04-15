<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { hashShaAsync, type ShaAlg } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const input = ref('');
const alg = ref<ShaAlg>('sha256');
const useSalt = ref(false);
const salt = ref('');

const output = ref('');
const bits = computed(() => output.value.length * 4);
const isSalted = ref(false);
const errorMsg = ref<string | null>(null);
const pending = ref(false);

async function compute() {
  errorMsg.value = null;
  pending.value = true;
  try {
    const out = await hashShaAsync(input.value, alg.value, useSalt.value ? salt.value : undefined);
    output.value = out.hash;
    isSalted.value = !!out.salt;
  } catch (e) {
    output.value = '';
    errorMsg.value = e instanceof Error ? e.message : String(e);
  } finally {
    pending.value = false;
  }
}

watch([input, alg, salt, useSalt], () => { if (input.value) compute(); else { output.value = ''; isSalted.value = false; } });

const cli = computed(() => {
  const parts = ['bun cli hash sha', `--algorithm ${alg.value}`, `--input "${input.value.replace(/"/g, '\\"').slice(0, 40)}"`];
  if (useSalt.value && salt.value) parts.push(`--salt "${salt.value}"`);
  return parts.join(' ');
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold">▸ Hash (SHA)</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">SHA-1/256/384/512. WebCrypto in browser, node:crypto in CLI. Optional salt.</p>
    </header>

    <div class="card p-5 space-y-4">
      <div>
        <label class="field-label">Input text</label>
        <textarea v-model="input" rows="4" class="font-mono" placeholder="type or paste text…" />
      </div>
      <div>
        <label class="field-label">Algorithm</label>
        <div class="tab-bar">
          <button v-for="a in (['sha1','sha256','sha384','sha512'] as const)" :key="a"
            type="button" @click="alg = a"
            :aria-pressed="alg === a"
            :class="{ 'is-active': alg === a }">{{ a.toUpperCase() }}</button>
        </div>
      </div>
      <div>
        <label class="flex items-center gap-3 cursor-pointer text-[0.92rem] select-none">
          <span class="switch" :class="{ 'is-on': useSalt }"><input type="checkbox" v-model="useSalt" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Add salt (keyed hash)</span>
        </label>
        <input v-if="useSalt" type="text" v-model="salt" placeholder="salt string…" class="font-mono mt-1" />
      </div>
      <div>
        <label class="field-label">Output
          <span v-if="isSalted" class="ml-2 pill pill-amber">salted</span>
          <span v-if="pending" class="ml-2 text-[0.75rem] text-[rgb(var(--fg-muted))]">computing…</span>
        </label>
        <div class="flex items-stretch gap-2">
          <code class="flex-1 break-all rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 font-mono text-[0.85rem]">{{ output || '—' }}</code>
          <CopyButton :value="output" />
        </div>
        <p v-if="output" class="text-[0.75rem] text-[rgb(var(--fg-muted))] mt-1">{{ bits }} bits · {{ output.length / 2 }} bytes</p>
        <p v-if="errorMsg" class="text-[0.8rem] text-[rgb(var(--danger))] mt-1" role="alert">// {{ errorMsg }}</p>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
