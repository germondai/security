<script setup lang="ts">
defineProps<{ variant?: 'outline' | 'ghost' | 'default'; size?: 'icon' | 'sm' | 'md' }>();
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:opacity-50',
      variant === 'outline' ? 'border bg-background hover:bg-muted' : '',
      variant === 'ghost' ? 'hover:bg-muted' : '',
      !variant || variant === 'default' ? 'bg-primary text-primary-foreground hover:opacity-90' : '',
      size === 'icon' ? 'h-9 w-9' : 'h-9 px-4',
    ]"
  >
    <slot />
  </button>
</template>
