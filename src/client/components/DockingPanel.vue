<script setup lang="ts">
import { useClient } from '../logic/client'

const { position: _position } = useFrameState()
const frameState = ref({
  position: _position.value,
})

const client = useClient()
const dockButton = [
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
  frameState.value.position = position
  client.value?.panel?.toggle(position)
  _position.value = position
}
</script>

<template>
  <div>
    <div px3 py2 border="b base" flex="~ col gap-1">
      <div text-sm op50>
        Dock devtools to
      </div>
      <div flex="~ gap-1" text-lg>
        <button
          v-for="(item) in dockButton"
          :key="item.position"
          :class="[frameState.position === item.position ? 'text-primary' : 'op50', item.icon]"
          @click="toggle(item.position)"
        />
      </div>
    </div>
    <div px3 py2 border="b base" flex="~ gap-2">
      <VDarkToggle v-slot="{ toggle, isDark }">
        <VButton n="sm primary" @click="toggle()">
          <div carbon-sun dark:carbon-moon translate-y--1px /> {{ isDark.value ? 'Dark' : 'Light' }}
        </VButton>
      </VDarkToggle>
      <RouterLink
        class="n-button-base active:n-button-active focus-visible:n-focus-base n-transition n-primary n-sm hover:n-button-hover n-disabled:n-disabled"
        to="/settings"
      >
        <div carbon-settings translate-y--1px /> Settings
      </RouterLink>
    </div>
  </div>
</template>
