<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  toBase64, fromBase64, toBase64Url, fromBase64Url,
  toBase32, fromBase32, toBase32Hex, fromBase32Hex,
  toBase58, fromBase58, toHex, fromHex,
  toBinary, fromBinary, toOctal, fromOctal, toDecimal, fromDecimal,
} from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import Select from '@/components/shared/Select.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

type Enc = 'base64' | 'base64url' | 'base32' | 'base32hex' | 'base58' | 'hex' | 'binary' | 'octal' | 'decimal';
const ENCS = [
  { value: 'base64'    as Enc, label: 'base64' },
  { value: 'base64url' as Enc, label: 'base64url' },
  { value: 'base32'    as Enc, label: 'base32' },
  { value: 'base32hex' as Enc, label: 'base32hex' },
  { value: 'base58'    as Enc, label: 'base58' },
  { value: 'hex'       as Enc, label: 'hex' },
  { value: 'binary'    as Enc, label: 'binary' },
  { value: 'octal'     as Enc, label: 'octal' },
  { value: 'decimal'   as Enc, label: 'decimal' },
];

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

function clearInput() { input.value = ''; }

const cli = computed(() => {
  if (mode.value === 'encode') {
    const inp = input.value ? input.value.replace(/"/g, '\\"').slice(0, 40) : 'hello';
    return `bun cli encode --to ${toEnc.value} --input "${inp}"`;
  }
  return `bun cli decode --from ${fromEnc.value} --input "${input.value.slice(0, 40)}"`;
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ Universal converter</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        Encode text to any common format, or decode any format back to text.
      </p>
    </header>

    <div class="card p-5 space-y-5">
      <!-- Row 1: mode tabs full-width on mobile, fit on desktop -->
      <div class="tab-bar w-full sm:w-fit">
        <button type="button" @click="mode = 'encode'" :aria-pressed="mode === 'encode'" :class="{ 'is-active': mode === 'encode' }">encode</button>
        <button type="button" @click="mode = 'decode'" :aria-pressed="mode === 'decode'" :class="{ 'is-active': mode === 'decode' }">decode</button>
      </div>

      <!-- Row 2: label | arrow | select — flex with equal label/select and auto-sized
                  arrow that sits exactly between them. -->
      <div class="flex items-center gap-3">
        <div class="flex-1 text-center sm:text-right">
          <span v-if="mode === 'encode'" class="text-[0.9rem] text-[rgb(var(--fg-muted))]">text</span>
          <span v-else class="text-[0.9rem] text-[rgb(var(--fg-muted))]">hex</span>
        </div>
        <span aria-hidden="true" class="shrink-0 text-[rgb(var(--fg-faint))]">→</span>
        <div class="flex-1">
          <Select v-if="mode === 'encode'" v-model="toEnc"   :options="ENCS" aria-label="target encoding" />
          <Select v-else                  v-model="fromEnc" :options="ENCS" aria-label="source encoding" />
        </div>
      </div>

      <!-- Row 3: swap + clear stretch evenly, copy button at the end. -->
      <div class="flex items-stretch gap-2">
        <button class="btn flex-1 justify-center" @click="swap"     :disabled="!output || !!error" title="Swap input ↔ output">↕ swap</button>
        <button class="btn flex-1 justify-center" @click="clearInput" :disabled="!input" title="Clear input">clear</button>
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

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>