<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: number] }>();

const min = computed(() => props.min ?? 1);
const max = computed(() => props.max ?? 128);
const step = computed(() => props.step ?? 1);
const pct = computed(() => {
  const range = max.value - min.value;
  return range === 0 ? 0 : ((props.modelValue - min.value) / range) * 100;
});

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', Number(target.value));
}
</script>

<template>
  <div class="grid gap-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-medium leading-none">{{ label }}</label>
      <span class="text-sm tabular-nums text-muted-foreground">{{ modelValue }}</span>
    </div>
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      @input="onInput"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
    />
  </div>
</template>
