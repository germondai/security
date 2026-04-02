<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; label: string; id?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const id = props.id ?? `cb-${Math.random().toString(36).slice(2, 9)}`;

function onChange(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="onChange"
      class="h-4 w-4 cursor-pointer rounded border accent-foreground"
    />
    <label :for="id" class="cursor-pointer text-sm leading-none">{{ label }}</label>
  </div>
</template>
