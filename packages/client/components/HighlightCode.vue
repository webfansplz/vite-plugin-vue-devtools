<script setup lang="ts">
const props = defineProps<{
  code: string
  filename: string
}>()

const { highlightedCode } = await useHighlight()
</script>

<template>
  <div class="overflow-y-auto p3">
    <div v-html="highlightedCode(code, filename.split('.').at(-1)!)" />
  </div>
</template>

<style scoped></style>
