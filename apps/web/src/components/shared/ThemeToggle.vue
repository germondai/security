<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

const { theme, set } = useTheme();
</script>

<template>
  <div class="tab-bar w-[7.5rem]" :title="`Theme: ${theme}`">
    <button
      type="button"
      @click="set('light')"
      :aria-pressed="theme === 'light'"
      :class="{ 'is-active': theme === 'light' }"
      aria-label="Light theme"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
    <button
      type="button"
      @click="set('system')"
      :aria-pressed="theme === 'system'"
      :class="{ 'is-active': theme === 'system' }"
      aria-label="System theme"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 21h8M12 18v3" />
      </svg>
    </button>
    <button
      type="button"
      @click="set('dark')"
      :aria-pressed="theme === 'dark'"
      :class="{ 'is-active': theme === 'dark' }"
      aria-label="Dark theme"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  </div>
</template>
