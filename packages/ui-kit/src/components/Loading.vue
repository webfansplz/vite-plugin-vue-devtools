<script setup lang="ts">
withDefaults(defineProps<{
  type: 'normal' | 'logo'
}>(), {
  type: 'normal',
})
</script>

<template>
  <div>
    <template v-if="type === 'normal'">
      <svg class="h-full w-full animate-spin text-green-500/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </template>
    <template v-else>
      <div i-logos-vue h-full w-full animate-pulse />
    </template>
  </div>
</template>
