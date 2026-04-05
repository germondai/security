<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  toBase64, fromBase64, toBase64Url, fromBase64Url,
  toBase32, fromBase32, toBase32Hex, fromBase32Hex,
  toBase58, fromBase58, toHex, fromHex,
  toBinary, fromBinary, toOctal, fromOctal, toDecimal, fromDecimal,
} from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';

type Enc = 'base64' | 'base64url' | 'base32' | 'base32hex' | 'base58' | 'hex' | 'binary' | 'octal' | 'decimal';
const ENCS: Enc[] = ['base64', 'base64url', 'base32', 'base32hex', 'base58', 'hex', 'binary', 'octal', 'decimal'];

const mode = ref<'encode' | 'decode'>('encode');
const fromEnc = ref<Enc>('base64');
const toEnc = ref<Enc>('hex');
const input = ref('');
const error = ref<string | null>(null);

const output = computed<string>(() => {
  error.value = null;
  if (!input.value) return '';
  try {
    if (mode.value === 'encode') {
      // input is treated as text (UTF-8) -> encode
      const bytes = new TextEncoder().encode(input.value);
      switch (toEnc.value) {
        case 'base64':    return toBase64(bytes);
        case 'base64url': return toBase64Url(bytes);
        case 'base32':    return toBase32(bytes);
        case 'base32hex': return toBase32Hex(bytes);
        case 'base58':    return toBase58(bytes);
        case 'hex':       return toHex(bytes);
        case 'binary':    return toBinary(bytes);
        case 'octal':     return toOctal(bytes);
        case 'decimal':   return toDecimal(bytes);
      }
    } else {
      // decode from `fromEnc` -> text (UTF-8)
      let bytes: Uint8Array;
      switch (fromEnc.value) {
        case 'base64':    bytes = fromBase64(input.value); break;
        case 'base64url': bytes = fromBase64Url(input.value); break;
        case 'base32':    bytes = fromBase32(input.value); break;
        case 'base32hex': bytes = fromBase32Hex(input.value); break;
        case 'base58':    bytes = fromBase58(input.value); break;
        case 'hex':       bytes = fromHex(input.value); break;
        case 'binary':    bytes = fromBinary(input.value); break;
        case 'octal':     bytes = fromOctal(input.value); break;
        case 'decimal':   bytes = fromDecimal(input.value); break;
      }
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    return '';
  }
  return '';
});

function swap() {
  if (output.value && !error.value) {
    input.value = output.value;
    mode.value = mode.value === 'encode' ? 'decode' : 'encode';
    if (mode.value === 'encode') fromEnc.value = toEnc.value;
    else toEnc.value = fromEnc.value;
  }
}
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ Universal converter</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Encode text to any common format, or decode any format back to text.
      </p>
    </header>

    <div class="card p-5 space-y-4">
      <div class="flex flex-wrap items-center gap-2 text-[0.85rem]">
        <div class="flex items-center gap-1 rounded-md border p-0.5">
          <button type="button" @click="mode = 'encode'" :class="['btn !py-1 !px-2 !text-xs', mode === 'encode' ? 'btn-accent' : '']">encode</button>
          <button type="button" @click="mode = 'decode'" :class="['btn !py-1 !px-2 !text-xs', mode === 'decode' ? 'btn-accent' : '']">decode</button>
        </div>
        <template v-if="mode === 'encode'">
          <span class="text-[rgb(var(--fg-muted))]">text →</span>
          <select v-model="toEnc" class="!w-auto !inline-block">
            <option v-for="e in ENCS" :key="e" :value="e">{{ e }}</option>
          </select>
        </template>
        <template v-else>
          <select v-model="fromEnc" class="!w-auto !inline-block">
            <option v-for="e in ENCS" :key="e" :value="e">{{ e }}</option>
          </select>
          <span class="text-[rgb(var(--fg-muted))]">→ text</span>
        </template>
        <button class="btn" @click="swap" :disabled="!output || !!error">↕ swap</button>
        <button class="btn" @click="input = ''">clear</button>
        <CopyButton :value="output" :disabled="!output" />
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="field-label">Input</label>
          <textarea v-model="input" rows="10"
            :placeholder="mode === 'encode' ? 'text to encode…' : 'encoded text to decode…'"
            spellcheck="false" class="font-mono" />
        </div>
        <div>
          <label class="field-label">Output</label>
          <textarea :value="output" rows="10" readonly placeholder="result…" class="font-mono" />
        </div>
      </div>

      <p v-if="error" class="text-[0.85rem] text-[rgb(var(--danger))]" role="alert">{{ error }}</p>
    </div>
  </article>
</template>
