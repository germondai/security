<script setup lang="ts">
// biome-ignore lint/style/useVueMultiWordComponentNames: intentional single-word UI primitive
defineOptions({ name: "AppCard" });
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
    <slot />
  </div>
</template>
