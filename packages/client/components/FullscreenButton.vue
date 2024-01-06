<script setup lang="ts">
import { useDevToolsClient } from '../logic/client'

const { viewMode } = useFrameState()
const client = useDevToolsClient()
const isFullscreen = computed(() => viewMode.value === 'fullscreen')
function toggleFullscreen() {
  client.value.panel?.toggleViewMode(isFullscreen.value ? 'default' : 'fullscreen')
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
