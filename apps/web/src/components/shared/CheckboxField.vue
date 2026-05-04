<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; label: string }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const onChange = (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).checked);
</script>

<template>
  <!-- biome-ignore lint/a11y/noLabelWithoutControl: label wraps the input below -->
  <label class="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      :checked="props.modelValue"
      @change="onChange"
      class="h-4 w-4 cursor-pointer rounded border"
    >
    <span class="text-sm leading-none">{{ label }}</span>
  </label>
</template>
