<script setup lang="ts">
import { ref } from 'vue';
import {
  rsaGenerateKeyPairAsync, ed25519GenerateKeyPairAsync, ecdsaGenerateKeyPairAsync,
} from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const kind = ref<'rsa' | 'ed25519' | 'ecdsa'>('ed25519');
const rsaSize = ref(2048);
const curve = ref<'P-256' | 'P-384' | 'P-521'>('P-256');
const loading = ref(false);
const error = ref<string | null>(null);
const result = ref<{ algorithm: string; keySize?: number; curve?: string; publicKey: string; privateKey: string } | null>(null);

async function regenerate() {
  loading.value = true;
  error.value = null;
  result.value = null;
  try {
    if (kind.value === 'rsa') {
      const k = await rsaGenerateKeyPairAsync(rsaSize.value as 2048 | 3072 | 4096);
      result.value = { algorithm: 'rsa', keySize: rsaSize.value, publicKey: k.publicKey, privateKey: k.privateKey };
    } else if (kind.value === 'ed25519') {
      const k = await ed25519GenerateKeyPairAsync();
      result.value = { algorithm: 'ed25519', publicKey: k.publicKey, privateKey: k.privateKey };
    } else {
      const k = await ecdsaGenerateKeyPairAsync(curve.value);
      result.value = { algorithm: 'ecdsa', curve: k.curve, publicKey: k.publicKey, privateKey: k.privateKey };
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
}

const cliCommand = () => {
  if (kind.value === 'rsa') return `bun cli key rsa --size ${rsaSize.value}`;
  if (kind.value === 'ed25519') return 'bun cli key ed25519';
  return `bun cli key ecdsa --curve ${curve.value}`;
};
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ Key pair generator</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Generate asymmetric key pairs in PEM format (SPKI public, PKCS8 private).
        Click <strong>Generate</strong> to start — RSA 4096 takes a few seconds.
      </p>
    </header>

    <div class="card p-5 space-y-5">
      <div>
        <label class="field-label">Algorithm</label>
        <div class="tab-bar">
          <button v-for="k in (['rsa','ed25519','ecdsa'] as const)" :key="k"
            type="button" @click="kind = k"
            :aria-pressed="kind === k"
            :class="{ 'is-active': kind === k }">{{ k.toUpperCase() }}</button>
        </div>
      </div>

      <div v-if="kind === 'rsa'">
        <label class="field-label">Modulus size</label>
        <div class="tab-bar">
          <button v-for="s in [2048, 3072, 4096]" :key="s"
            type="button" @click="rsaSize = s"
            :aria-pressed="rsaSize === s"
            :class="{ 'is-active': rsaSize === s }">{{ s }}</button>
        </div>
        <p class="mt-2 text-[0.78rem] text-[rgb(var(--fg-muted))]">3072 takes ~1-2s; 4096 takes ~5-10s on a modern laptop.</p>
      </div>

      <div v-else-if="kind === 'ecdsa'">
        <label class="field-label">Curve</label>
        <div class="tab-bar">
          <button v-for="c in (['P-256','P-384','P-521'] as const)" :key="c"
            type="button" @click="curve = c"
            :aria-pressed="curve === c"
            :class="{ 'is-active': curve === c }">{{ c }}</button>
        </div>
      </div>

      <button class="btn btn-accent w-full" :disabled="loading" @click="regenerate">
        {{ loading ? 'Generating…' : '↻ Generate' }}
      </button>

      <p v-if="error" class="text-[0.85rem] text-[rgb(var(--danger))]" role="alert">
        {{ error }}
      </p>

      <div v-if="result" class="space-y-3">
        <div>
          <label class="field-label">Public key</label>
          <div class="flex items-stretch gap-2">
            <pre class="pre-block flex-1 whitespace-pre overflow-x-auto">{{ result.publicKey }}</pre>
            <CopyButton :value="result.publicKey" />
          </div>
        </div>
        <div>
          <label class="field-label flex items-center gap-2">
            Private key
            <span class="pill pill-danger">sensitive</span>
          </label>
          <div class="flex items-stretch gap-2">
            <pre class="pre-block flex-1 whitespace-pre overflow-x-auto">{{ result.privateKey }}</pre>
            <CopyButton :value="result.privateKey" />
          </div>
        </div>
      </div>

      <p v-else-if="!loading && !error" class="text-[0.85rem] text-[rgb(var(--fg-muted))]">
        Click <strong>Generate</strong> to create a key pair.
      </p>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cliCommand()" />
      </div>
    </div>
  </article>
</template>
