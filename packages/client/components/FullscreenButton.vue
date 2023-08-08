<script setup lang="ts">
import { useDevToolsClient } from '../logic/client'

const isFullscreen = ref(false)
const client = useDevToolsClient()

function toggleFullscreen() {
  client.value.panel?.toggleViewMode(isFullscreen.value ? 'default' : 'fullscreen')
  isFullscreen.value = !isFullscreen.value
}
</script>

<template>
  <div flex="~ gap-1">
    <VDButton n="sm primary" @click="toggleFullscreen">
      <template v-if="isFullscreen">
        <i material-symbols:fullscreen-exit /> Exit Fullscreen
      </template>
      <template v-else>
        <i material-symbols:fullscreen /> Fullscreen
      </template>
    </VDButton>
  </div>
</template>
