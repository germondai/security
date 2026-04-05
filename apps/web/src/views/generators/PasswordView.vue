<script setup lang="ts">
import { ref, computed } from 'vue';
import { generatePassword, analyzePassword, type PasswordOptions } from '@germondai/security';
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

const strength = computed(() => {
  const p = outputs.value[0];
  return p ? analyzePassword(p) : null;
});

function scoreColor(score: number): string {
  return ['rgb(var(--danger))', 'rgb(var(--danger))', 'rgb(var(--accent-2))', 'rgb(var(--accent))', 'rgb(var(--ok))'][score] ?? '';
}

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
          <button type="button" @click="applyPreset('memorable')" :class="{ 'is-active': activePreset === 'memorable' }" aria-pressed="false">Memorable</button>
          <button type="button" @click="applyPreset('standard')" :class="{ 'is-active': activePreset === 'standard' }" aria-pressed="false">Standard</button>
          <button type="button" @click="applyPreset('maximum')" :class="{ 'is-active': activePreset === 'maximum' }" aria-pressed="false">Maximum</button>
        </div>
      </div>

      <div class="space-y-2">
        <div v-for="(pwd, idx) in outputs" :key="idx" class="flex items-stretch gap-2">
          <div class="flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2.5 font-mono text-[0.95rem]">{{ pwd || '—' }}</div>
          <button class="btn shrink-0" @click="regenerate" aria-label="Regenerate">↻</button>
          <CopyButton :value="pwd" />
        </div>
      </div>

      <div v-if="strength && count === 1" class="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[0.78rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Strength</span>
          <span class="font-bold text-[0.95rem]" :style="{ color: scoreColor(strength.score) }">
            {{ strength.label }} · score {{ strength.score }}/4
          </span>
        </div>
        <div class="flex gap-1.5">
          <div v-for="i in 5" :key="i" class="h-2.5 flex-1 rounded-full border"
            :style="{ background: i <= strength.score + 1 ? scoreColor(strength.score) : 'transparent', borderColor: i <= strength.score + 1 ? scoreColor(strength.score) : 'rgb(var(--border))' }" />
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-[0.85rem] pt-1 sm:grid-cols-4">
          <div>
            <div class="text-[0.65rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Length</div>
            <div class="font-bold text-[1.05rem] tabular-nums">{{ strength.length }}</div>
            <div class="text-[0.7rem] text-[rgb(var(--fg-muted))]">characters</div>
          </div>
          <div>
            <div class="text-[0.65rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Entropy</div>
            <div class="font-bold text-[1.05rem] tabular-nums">{{ strength.effectiveBits.toFixed(1) }}</div>
            <div class="text-[0.7rem] text-[rgb(var(--fg-muted))]">bits</div>
          </div>
          <div>
            <div class="text-[0.65rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Pool</div>
            <div class="font-bold text-[1.05rem] tabular-nums">{{ strength.poolSize }}</div>
            <div class="text-[0.7rem] text-[rgb(var(--fg-muted))]">chars</div>
          </div>
          <div>
            <div class="text-[0.65rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Crackable (avg)</div>
            <div class="font-bold text-[1.05rem] tabular-nums">{{ strength.crackTimes.find(c => c.scenario === 'offline (bcrypt/scrypt)')?.averageHuman ?? '—' }}</div>
            <div class="text-[0.7rem] text-[rgb(var(--fg-muted))]">bcrypt-class attack</div>
          </div>
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

      <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-[0.9rem] sm:grid-cols-3">
        <label class="flex items-center gap-2"><input type="checkbox" v-model="lower" /> Lowercase (a–z)</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="upper" /> Uppercase (A–Z)</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="digits" /> Digits (0–9)</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="symbols" /> Symbols (!@#…)</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="excludeAmbiguous" /> Exclude ambiguous (0Oo1lI|`')</label>
        <label class="flex items-center gap-2"><input type="checkbox" v-model="requireEach" /> Require each class</label>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
