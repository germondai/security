<script setup lang="ts">
import { ref, computed } from 'vue';
import { generatePassphrase } from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const words = ref(8);
const separator = ref('-');
const capitalize = ref(false);
const includeNumber = ref(false);
const seed = ref(0);

const phrase = computed(() => {
  void seed.value;
  return generatePassphrase({
    words: words.value, separator: separator.value,
    capitalize: capitalize.value, includeNumber: includeNumber.value,
  });
});

const bits = computed(() => words.value * 9.97);
function regenerate() { seed.value++; }

const cli = computed(() => {
  const parts = ['bun cli gen passphrase', `--words ${words.value}`];
  if (separator.value !== '-') parts.push(`--separator '${separator.value}'`);
  if (capitalize.value)   parts.push('--capitalize');
  if (includeNumber.value) parts.push('--with-number');
  return parts.join(' ');
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">▸ Passphrase generator</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">Diceware-style. 8 words ≈ 80 bits. Up to 32 words.</p>
    </header>

    <div class="card p-5 space-y-5">
      <div class="flex items-stretch gap-2 min-w-0">
        <div class="min-w-0 flex-1 flex items-center scroll-x-hidden whitespace-nowrap rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 h-[2.4rem] font-mono text-[1.05rem] tracking-wide">{{ phrase }}</div>
        <button class="btn-icon shrink-0" @click="regenerate" aria-label="Regenerate">↻</button>
        <CopyButton :value="phrase" />
      </div>

      <p class="text-[0.85rem] text-[rgb(var(--fg-muted))]">
        Estimated entropy: <span class="font-mono text-[rgb(var(--accent))]">~{{ bits.toFixed(0) }} bits</span>
        <span v-if="bits < 50" class="ml-2 text-[rgb(var(--danger))]">— consider at least 5 words</span>
        <span v-else-if="bits >= 70" class="ml-2 text-[rgb(var(--ok))]">— strong</span>
      </p>

      <div class="space-y-4">
        <div class="flex flex-col">
          <label class="field-label">Words: <span class="text-[rgb(var(--accent))]">{{ words }}</span></label>
          <input type="range" :min="2" :max="32" :step="1" v-model.number="words" class="w-full" />
        </div>
        <div class="flex flex-col">
          <label class="field-label">Separator</label>
          <input type="text" v-model="separator" maxlength="3" class="font-mono" />
        </div>
      </div>
      <div class="space-y-3 text-[0.92rem] sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2 sm:space-y-0">
        <label class="flex items-center gap-3 cursor-pointer">
          <span class="switch" :class="{ 'is-on': capitalize }">
            <input type="checkbox" v-model="capitalize" class="sr-only" />
            <span class="switch-knob"></span>
          </span>
          <span>Capitalize each word</span>
        </label>
        <label class="flex items-center gap-3 cursor-pointer">
          <span class="switch" :class="{ 'is-on': includeNumber }">
            <input type="checkbox" v-model="includeNumber" class="sr-only" />
            <span class="switch-knob"></span>
          </span>
          <span>Append a random 0-999</span>
        </label>
      </div>

      <div class="space-y-1 border-t pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
