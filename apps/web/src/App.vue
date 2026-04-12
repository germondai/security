<script setup lang="ts">
import { ref } from 'vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';

const sidebarOpen = ref(false);
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value; }
function closeSidebar()  { sidebarOpen.value = false; }
</script>

<template>
  <div class="flex h-screen w-screen text-[rgb(var(--fg))]">
    <!-- Backdrop overlay for mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-30 bg-black/40 md:hidden" @click="closeSidebar"></div>

    <!-- Sidebar: slides in on mobile, always visible on desktop -->
    <AppSidebar
      :class="[
        sidebarOpen ? 'flex' : 'hidden',
        'md:flex',
        'fixed md:static inset-y-0 left-0 z-40 md:z-auto w-72 transform transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
      @navigate="closeSidebar"
    />

    <main class="flex-1 overflow-y-auto min-w-0">
      <!-- Mobile top bar with hamburger -->
      <header class="sticky top-0 z-20 flex items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 px-4 py-2.5 backdrop-blur md:hidden">
        <button
          type="button"
          class="btn-icon"
          aria-label="Open navigation"
          @click="toggleSidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span class="font-semibold tracking-tight">gsec</span>
      </header>

      <div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <RouterView />
      </div>
    </main>
  </div>
</template>