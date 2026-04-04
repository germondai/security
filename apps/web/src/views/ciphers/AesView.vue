<script setup lang="ts">
import { ref, computed } from 'vue';
import { aesGcmEncrypt, aesGcmDecrypt } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const mode = ref<'encrypt' | 'decrypt'>('encrypt');
const key = ref('');
const plain = ref('');
const iv = ref('');
const authTag = ref('');
const cipher = ref('');
const output = ref('');
const error = ref<string | null>(null);

function doEncrypt() {
  error.value = null;
  try {
    const r = aesGcmEncrypt(plain.value, { key: key.value, outputEncoding: 'base64' });
    cipher.value = r.ciphertext;
    iv.value = r.iv;
    authTag.value = r.authTag;
    output.value = JSON.stringify({ ciphertext: r.ciphertext, iv: r.iv, authTag: r.authTag, algorithm: r.algorithm }, null, 2);
  } catch (e) { error.value = e instanceof Error ? e.message : String(e); }
}

function doDecrypt() {
  error.value = null;
  try {
    output.value = aesGcmDecrypt({
      key: key.value,
      iv: iv.value,
      authTag: authTag.value,
      ciphertext: cipher.value,
      encoding: 'base64',
    });
  } catch (e) { error.value = e instanceof Error ? e.message : String(e); }
}

const resultJson = computed(() => output.value);

const cliCommand = computed(() => {
  if (mode.value === 'encrypt') {
    const inp = plain.value.length > 0 ? `"${plain.value.replace(/"/g, '\\"').slice(0, 40)}"` : '"hello"';
    return `bun cli enc aes --key "${key.value}" --input ${inp}`;
  }
  return `bun cli dec aes --key "${key.value}" --ciphertext "${cipher.value.slice(0, 40)}"`;
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ AES-256-GCM</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Authenticated encryption. The key is a passphrase; it is SHA-256-derived
        to 32 bytes internally. Output is JSON with <code>ciphertext</code>,
        <code>iv</code>, and <code>authTag</code>.
      </p>
    </header>

    <div class="card p-5 space-y-4">
      <div class="tab-bar">
        <button type="button" @click="mode = 'encrypt'" :aria-pressed="mode === 'encrypt'" :class="{ 'is-active': mode === 'encrypt' }">encrypt</button>
        <button type="button" @click="mode = 'decrypt'" :aria-pressed="mode === 'decrypt'" :class="{ 'is-active': mode === 'decrypt' }">decrypt</button>
      </div>

      <div>
        <label class="field-label">Passphrase</label>
        <input type="text" v-model="key" class="font-mono" autocomplete="off" />
      </div>

      <div v-if="mode === 'encrypt'">
        <label class="field-label">Plaintext</label>
        <textarea v-model="plain" rows="6" class="font-mono" />
        <button class="btn btn-accent mt-3" @click="doEncrypt">Encrypt →</button>
      </div>

      <div v-else class="space-y-3">
        <div>
          <label class="field-label">IV (hex)</label>
          <input type="text" v-model="iv" class="font-mono" />
        </div>
        <div>
          <label class="field-label">Auth tag (hex)</label>
          <input type="text" v-model="authTag" class="font-mono" />
        </div>
        <div>
          <label class="field-label">Ciphertext (base64)</label>
          <textarea v-model="cipher" rows="4" class="font-mono" />
        </div>
        <button class="btn btn-accent" @click="doDecrypt">Decrypt →</button>
      </div>

      <p v-if="error" class="text-[0.85rem] text-[rgb(var(--danger))]" role="alert">{{ error }}</p>

      <div v-if="output">
        <label class="field-label">{{ mode === 'encrypt' ? 'Encrypted bundle (give this to dec)' : 'Decrypted plaintext' }}</label>
        <pre class="pre-block whitespace-pre-wrap break-all">{{ output }}</pre>
        <div class="mt-2 flex gap-2">
          <CopyButton :value="output" />
        </div>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cliCommand" />
      </div>
    </div>
  </article>
</template>
