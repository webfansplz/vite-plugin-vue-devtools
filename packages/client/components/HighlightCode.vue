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

<style scoped></style>
