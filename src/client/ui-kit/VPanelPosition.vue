<script setup lang="ts">
import { useDevtoolsClient } from '../logic/client'

const { position: _position } = useFrameState()

const frameState = computed(() => ({ position: _position.value }))

const client = useDevtoolsClient()

const dockButton = [
  {
    position: 'popup',
    icon: 'i-carbon-launch',
  },
  {
    position: 'bottom',
    icon: 'i-carbon-open-panel-filled-bottom',
  },
  {
    position: 'right',
    icon: 'i-carbon-open-panel-filled-right',
  },
  {
    position: 'left',
    icon: 'i-carbon-open-panel-filled-left',
  },
  {
    position: 'top',
    icon: 'i-carbon-open-panel-filled-top',
  },
]

function toggle(position: string) {
  client.value?.panel?.togglePosition(position)
  if (position === 'popup')
    return

  _position.value = position
}
</script>

<template>
  <div flex="~ gap-1" text-lg>
    <button
      v-for="item in dockButton" :key="item.position"
      :class="[frameState.position === item.position ? 'text-primary' : 'op50', item.icon]"
      @click="toggle(item.position)"
    />
  </div>
</template>
