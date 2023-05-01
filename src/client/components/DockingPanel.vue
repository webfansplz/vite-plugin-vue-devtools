<script setup lang="ts">
const frameState = ref({
  position: 'bottom',
})

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
  window.parent.__VUE_DEVTOOLS_TOGGLE_PANEL_POSITION__(position)
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
      <VButton n="sm primary" to="/settings">
        <div carbon-settings translate-y--1px /> Settings
      </VButton>
    </div>
  </div>
</template>
