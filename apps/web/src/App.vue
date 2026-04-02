<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
</script>

<template>
  <div class="flex h-screen w-screen text-[rgb(var(--fg))]">
    <AppSidebar class="hidden md:flex" />
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <RouterView />
      </div>
    </main>
  </div>
</template>
