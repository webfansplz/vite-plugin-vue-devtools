<script setup lang="ts">
import { state } from './composables/state'

const props = defineProps<{
  isDragging: boolean
}>()

const container = ref<HTMLElement>()
const isResizing = ref<false | { top?: boolean; left?: boolean; right?: boolean; bottom?: boolean }>(false)

watchEffect(() => {
  if (!container.value)
    return

  if (state.value.open) {
    const iframe = props.client.getIframe()
    iframe.style.pointerEvents = isResizing.value || props.isDragging ? 'none' : 'auto'

    if (!popupWindow.value) {
      if (Array.from(container.value.children).every(el => el !== iframe))
        container.value.appendChild(iframe)
    }
  }
})
</script>

<template />

<style scoped></style>
