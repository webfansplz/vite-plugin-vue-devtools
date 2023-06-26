<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isDragging: boolean
}>()

// const { } = getI

const container = ref<HTMLElement>()
const isResizing = ref<false | { top?: boolean; left?: boolean; right?: boolean; bottom?: boolean }>(false)

// watchEffect(() => {
//   if (!modalRef.value || isInPopup.value)
//     return

//   if (panelVisible.value) {
//     const iframe = getIframe()
//     iframe.style.pointerEvents = isDragging.value ? 'none' : 'auto'

//     if (!innerIframe && Array.from(modalRef.value.children).every(el => el !== iframe))
//       modalRef.value.appendChild(iframe)

//     innerIframe = iframe
//   }
// })
</script>

<template />

<style scoped></style>
