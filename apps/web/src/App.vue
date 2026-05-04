<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import ThemeToggle from "@/components/shared/ThemeToggle.vue";

const sidebarOpen = ref(false);
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
const closeSidebar = () => {
  sidebarOpen.value = false;
};

const route = useRoute();
const isHome = computed(() => route.path === "/");
</script>

<template>
  <div class="flex h-screen w-screen text-[rgb(var(--fg))]">
    <button
      v-if="sidebarOpen"
      type="button"
      class="fixed inset-0 z-30 bg-black/40 md:hidden cursor-default"
      aria-label="Close navigation"
      @click="closeSidebar"
    />

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
      <!-- Mobile top bar — z-50 keeps buttons above sidebar (z-40) and backdrop (z-30) -->
      <header
        class="sticky top-0 z-50 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/90 backdrop-blur md:hidden"
      >
        <div class="flex items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            class="btn-icon"
            :aria-label="sidebarOpen ? 'Close navigation' : 'Open navigation'"
            :title="sidebarOpen ? 'Close navigation' : 'Open navigation'"
            @click="toggleSidebar"
          >
            <svg
              v-if="!sidebarOpen"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <svg
                :width="isHome ? 18 : 16"
                :height="isHome ? 18 : 16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0 text-[rgb(var(--accent))]"
                aria-hidden="true"
              >
                <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <div class="min-w-0 leading-tight">
                <div
                  :class="isHome ? 'truncate text-[1rem] font-bold tracking-tight' : 'truncate font-semibold tracking-tight'"
                >
                  Germond's Security
                </div>
                <div
                  class="truncate text-[rgb(var(--fg-muted))]"
                  :class="isHome ? 'text-[0.7rem]' : 'text-[0.65rem]'"
                >
                  {{ isHome ? 'cryptography toolkit' : 'Security & cryptography toolkit' }}
                </div>
              </div>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <RouterView />
      </div>
    </main>
  </div>
</template>
