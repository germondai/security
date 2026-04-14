<script setup lang="ts" generic="T extends string | number">
/**
 * Custom-styled <select> replacement built on the native <select> element so
 * keyboard / accessibility / form behaviour stays identical, but it looks like
 * the rest of the app. Trigger the native picker from a styled wrapper so we
 * get a consistent focus ring, radius, and hover state.
 */
import { computed } from 'vue';

const props = defineProps<{
  modelValue: T;
  options: readonly { value: T; label: string }[];
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();

const currentLabel = computed(() => props.options.find((o) => o.value === props.modelValue)?.label ?? String(props.modelValue));

function onChange(e: Event) {
  const t = e.target as HTMLSelectElement;
  emit('update:modelValue', t.value as T);
}
</script>

<template>
  <label class="ui-select">
    <span v-if="ariaLabel" class="sr-only">{{ ariaLabel }}</span>
    <span class="ui-select-value">{{ currentLabel }}</span>
    <svg class="ui-select-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
    <select :value="modelValue" @change="onChange" class="ui-select-native">
      <option v-for="o in options" :key="String(o.value)" :value="o.value">{{ o.label }}</option>
    </select>
  </label>
</template>

<style scoped>
.ui-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.4rem;
  padding: 0 0.7rem;
  border: 1px solid rgb(var(--border-strong));
  border-radius: 8px;
  background: rgb(var(--bg));
  color: rgb(var(--fg));
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: background 120ms, border-color 120ms, box-shadow 120ms;
  white-space: nowrap;
}
.ui-select:hover { background: rgb(var(--bg-hover)); border-color: rgb(var(--fg-faint)); }
.ui-select:focus-within { border-color: rgb(var(--accent)); box-shadow: 0 0 0 3px rgb(var(--accent) / 0.18); }
.ui-select-value { line-height: 1; }
.ui-select-chev { color: rgb(var(--fg-muted)); flex-shrink: 0; }
/* Native select is invisible but covers the wrapper for native UI. */
.ui-select-native {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  background: transparent;
}
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
</style>