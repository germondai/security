<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ command: string }>();
const copied = ref(false);
const has = computed(() => props.command && props.command.length > 0);
async function copy() {
	if (!has.value) return;
	try {
		await navigator.clipboard.writeText(props.command);
		copied.value = true;
		setTimeout(() => (copied.value = false), 1500);
	} catch {
		/* ignore */
	}
}
</script>

<template>
  <div v-if="has" class="relative">
    <code
      class="block min-h-[2.4rem] scroll-x-hidden whitespace-nowrap rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] pl-3 pr-12 py-2 font-mono text-[0.78rem] text-[rgb(var(--fg-muted))] leading-[1.4]"
      :title="command"
    >$ {{ command }}</code>
    <button
      type="button"
      @click="copy"
      class="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 [border-radius:8px] border border-[rgb(var(--border-strong))] bg-[rgb(var(--bg))] text-[rgb(var(--fg-muted))] hover:bg-[rgb(var(--bg-hover))] hover:border-[rgb(var(--fg-faint))] hover:text-[rgb(var(--accent))] transition-colors"
      :title="copied ? 'Copied' : 'Copy CLI command'"
      :aria-label="copied ? 'Copied' : 'Copy CLI command'"
    >
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </button>
  </div>
</template>
