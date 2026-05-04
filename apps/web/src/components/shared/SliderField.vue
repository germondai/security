<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();

const cMin = computed(() => props.min ?? 1);
const cMax = computed(() => props.max ?? 128);
const cStep = computed(() => props.step ?? 1);
const pct = computed(() => {
  const range = cMax.value - cMin.value;
  return range === 0 ? 0 : ((props.modelValue - cMin.value) / range) * 100;
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", Number(target.value));
}
</script>

<template>
  <div class="grid gap-2">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium leading-none">{{ label }}</span>
      <span class="text-sm tabular-nums text-[rgb(var(--fg-muted))]">{{ modelValue }}</span>
    </div>
    <input
      type="range"
      :min="cMin"
      :max="cMax"
      :step="cStep"
      :value="modelValue"
      :aria-label="label"
      @input="onInput"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgb(var(--border))]"
    >
  </div>
</template>
