<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ value: string; disabled?: boolean }>();
const copied = ref(false);

async function copy() {
  if (props.disabled) return;
  try {
    await navigator.clipboard.writeText(props.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <button
    type="button"
    @click="copy"
    :disabled="disabled"
    :aria-label="copied ? 'Copied' : 'Copy'"
    :title="disabled ? 'Nothing to copy' : (copied ? 'Copied' : 'Copy to clipboard')"
    class="btn-icon"
  >
    <svg
      v-if="!copied"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  </button>
</template>
