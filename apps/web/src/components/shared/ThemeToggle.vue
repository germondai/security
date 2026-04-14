<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const { theme, cycle } = useTheme();

const label = computed(() => `Theme: ${theme.value} (click to change)`);

const iconPath = computed(() => {
  if (theme.value === 'light') {
    return 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41';
  }
  if (theme.value === 'dark') {
    return 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';
  }
  // system: half-filled circle (sun behind monitor)
  return 'M3 6h18M3 12h18M3 18h12';
});
</script>

<template>
  <button
    type="button"
    @click="cycle"
    :title="label"
    :aria-label="label"
    class="theme-toggle"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle v-if="theme === 'light'" cx="12" cy="12" r="4" />
      <path :d="iconPath" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid rgb(var(--border-strong));
  border-radius: 8px;
  background: rgb(var(--bg));
  color: rgb(var(--fg-muted));
  cursor: pointer;
  transition: background 120ms, border-color 120ms, color 120ms;
  flex-shrink: 0;
}
.theme-toggle:hover { background: rgb(var(--bg-hover)); border-color: rgb(var(--fg-faint)); color: rgb(var(--accent)); }
.theme-toggle:active { transform: translateY(0.5px); }
</style>