<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; label: string; id?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const fieldId = props.id ?? `cb-${Math.random().toString(36).slice(2, 9)}`;

function onChange(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.checked);
}
</script>

<template>
  <!-- biome-ignore lint/a11y/noLabelWithoutControl: label wraps the input below -->
  <label class="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="onChange"
      class="h-4 w-4 cursor-pointer rounded border accent-foreground"
    >
    <span class="text-sm leading-none">{{ label }}</span>
  </label>
</template>
