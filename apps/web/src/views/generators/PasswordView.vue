<script setup lang="ts">
import { ref, computed } from 'vue';
import { generatePassword, type PasswordOptions } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

type Preset = 'memorable' | 'standard' | 'maximum';

const activePreset = ref<Preset>('standard');
const length = ref(20);
const lower = ref(true);
const upper = ref(true);
const digits = ref(true);
const symbols = ref(true);
const excludeAmbiguous = ref(false);
const requireEach = ref(false);
const count = ref(1);
const seed = ref(0);

function applyPreset(p: Preset) {
  activePreset.value = p;
  if (p === 'memorable') {
    length.value = 20; symbols.value = false; digits.value = false; upper.value = false; lower.value = true;
    excludeAmbiguous.value = true; requireEach.value = false;
  } else if (p === 'standard') {
    length.value = 16; lower.value = true; upper.value = true; digits.value = true; symbols.value = true;
    excludeAmbiguous.value = false; requireEach.value = true;
  } else {
    length.value = 32; lower.value = true; upper.value = true; digits.value = true; symbols.value = true;
    excludeAmbiguous.value = true; requireEach.value = true;
  }
  regenerate();
}

const options = computed<PasswordOptions>(() => ({
  length: length.value, lower: lower.value, upper: upper.value, digits: digits.value,
  symbols: symbols.value, excludeAmbiguous: excludeAmbiguous.value, requireEach: requireEach.value,
}));

const outputs = computed<string[]>(() => {
  void seed.value;
  try { return Array.from({ length: count.value }, () => generatePassword(options.value)); }
  catch { return []; }
});

function regenerate() { seed.value++; }

const cli = computed(() => {
  const parts = ['bun cli gen password', `--length ${length.value}`];
  if (!lower.value)   parts.push('--no-lower');
  if (!upper.value)   parts.push('--no-upper');
  if (!digits.value)  parts.push('--no-digits');
  if (!symbols.value) parts.push('--no-symbols');
  if (excludeAmbiguous.value) parts.push('--exclude-ambiguous');
  if (requireEach.value)      parts.push('--require-each');
  if (count.value !== 1)      parts.push(`--count ${count.value}`);
  return parts.join(' ');
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold">▸ Password generator</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">Cryptographically random, generated locally with <code>node:crypto</code>.</p>
    </header>

    <div class="card p-5 space-y-5">
      <div>
        <label class="field-label">Presets</label>
        <div class="tab-bar">
          <button type="button" @click="applyPreset('memorable')" :class="{ 'is-active': activePreset === 'memorable' }">Memorable</button>
          <button type="button" @click="applyPreset('standard')"  :class="{ 'is-active': activePreset === 'standard' }">Standard</button>
          <button type="button" @click="applyPreset('maximum')"   :class="{ 'is-active': activePreset === 'maximum' }">Maximum</button>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="(pwd, idx) in outputs" :key="idx" class="flex items-stretch gap-2 min-w-0">
          <div class="min-w-0 flex-1 flex items-center scroll-x-hidden whitespace-nowrap rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 h-[2.4rem] font-mono text-[0.95rem]">{{ pwd || '—' }}</div>
          <button class="btn-icon shrink-0" @click="regenerate" aria-label="Regenerate">↻</button>
          <CopyButton :value="pwd" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="field-label">Length: <span class="text-[rgb(var(--accent))]">{{ length }}</span></label>
          <input type="range" :min="4" :max="128" :step="1" v-model.number="length" class="w-full" />
        </div>
        <div>
          <label class="field-label">Count: <span class="text-[rgb(var(--accent))]">{{ count }}</span></label>
          <input type="range" :min="1" :max="20" :step="1" v-model.number="count" class="w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 text-[0.9rem] sm:grid-cols-2 lg:grid-cols-3">
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': lower }"><input type="checkbox" v-model="lower" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Lowercase (a–z)</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': upper }"><input type="checkbox" v-model="upper" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Uppercase (A–Z)</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': digits }"><input type="checkbox" v-model="digits" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Digits (0–9)</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': symbols }"><input type="checkbox" v-model="symbols" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Symbols (!@#…)</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': excludeAmbiguous }"><input type="checkbox" v-model="excludeAmbiguous" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Exclude ambiguous (0Oo1lI|`')</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer select-none">
          <span class="switch" :class="{ 'is-on': requireEach }"><input type="checkbox" v-model="requireEach" class="sr-only" /><span class="switch-knob"></span></span>
          <span>Require each class</span>
        </label>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
