<script setup lang="ts">
defineProps<{
  code: string
  filename: string
}>()

const { highlightedCode } = await useHighlight()
</script>

<template>
  <div class="overflow-x-auto overflow-y-auto">
    <div v-html="highlightedCode(code, filename.split('.').at(-1)!)" />
  </div>
</template>

<style scoped>
/* copied from https://github.com/shikijs/shiki/issues/3 */
:deep(code) {
  counter-reset: step;
  counter-increment: step 0;
}

:deep(code) .line::before {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  @apply text-gray-400;
}
</style>
