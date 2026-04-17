<script setup lang="ts">
import { ref, computed } from 'vue';
import { jwtSign, jwtVerify, type JwtVerifyResult } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const mode = ref<'sign' | 'verify'>('sign');
const secret = ref('');
const payloadText = ref('{"sub":"1234","name":"Alice"}');
const token = ref('');
const result = ref<JwtVerifyResult | null>(null);
const error = ref<string | null>(null);

function doSign() {
  error.value = null; result.value = null;
  try {
    const payload = JSON.parse(payloadText.value) as Record<string, unknown>;
    token.value = jwtSign({ algorithm: 'HS256', secret: secret.value, payload });
  } catch (e) { error.value = e instanceof Error ? e.message : String(e); }
}

function doVerify() {
  error.value = null; result.value = null;
  try {
    result.value = jwtVerify({ token: token.value, secret: secret.value });
  } catch (e) { error.value = e instanceof Error ? e.message : String(e); }
}

const cliCommand = computed(() => {
  if (mode.value === 'sign') {
    return `bun cli jwt sign --secret "${secret.value || 'x'}" --payload '${payloadText.value.replace(/'/g, "'\\''")}'`;
  }
  return `bun cli jwt verify --secret "${secret.value || 'x'}" --token "${token.value.slice(0, 60)}"`;
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ JWT (HS256)</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Sign and verify JSON Web Tokens with HMAC-SHA256. v0.1 supports HS256
        only; RSA/ECDSA JWTs are planned.
      </p>
    </header>

    <div class="card p-5 space-y-4">
      <div class="tab-bar">
        <button type="button" @click="mode = 'sign'"   :aria-pressed="mode === 'sign'"   :class="{ 'is-active': mode === 'sign' }">sign</button>
        <button type="button" @click="mode = 'verify'" :aria-pressed="mode === 'verify'" :class="{ 'is-active': mode === 'verify' }">verify</button>
      </div>

      <div>
        <label class="field-label">HMAC secret</label>
        <input type="text" v-model="secret" class="font-mono" autocomplete="off" />
      </div>

      <div v-if="mode === 'sign'" class="space-y-3">
        <div>
          <label class="field-label">Payload (JSON object)</label>
          <textarea v-model="payloadText" rows="6" class="font-mono" />
        </div>
        <button class="btn btn-accent w-full" @click="doSign">Sign →</button>
      </div>

      <div v-else>
        <div>
          <label class="field-label">Token</label>
          <textarea v-model="token" rows="4" class="font-mono break-all" placeholder="paste a JWT…" />
        </div>
        <button class="btn btn-accent w-full" @click="doVerify">Verify →</button>
      </div>

      <p v-if="error" class="text-[0.85rem] text-[rgb(var(--danger))]" role="alert">{{ error }}</p>

      <div v-if="mode === 'sign' && token">
        <label class="field-label">Signed token</label>
        <div class="flex items-stretch gap-2">
          <code class="flex-1 break-all rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 font-mono text-[0.82rem]">{{ token }}</code>
          <CopyButton :value="token" />
        </div>
      </div>

      <div v-if="mode === 'verify' && result">
        <div class="rounded-md border p-3" :style="{ borderColor: result.valid ? 'rgb(var(--ok))' : 'rgb(var(--danger))' }">
          <div class="font-bold" :style="{ color: result.valid ? 'rgb(var(--ok))' : 'rgb(var(--danger))' }">
            {{ result.valid ? '✓ Valid' : '✗ ' + (result.error ?? 'Invalid') }}
          </div>
          <div v-if="result.issuedAt" class="text-[0.8rem] text-[rgb(var(--fg-muted))]">Issued: {{ result.issuedAt.toISOString() }}</div>
          <div v-if="result.expiresAt" class="text-[0.8rem] text-[rgb(var(--fg-muted))]">Expires: {{ result.expiresAt.toISOString() }}</div>
        </div>
        <pre v-if="result.payload" class="pre-block mt-3">{{ JSON.stringify(result.payload, null, 2) }}</pre>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cliCommand" />
      </div>
    </div>
  </article>
</template>
