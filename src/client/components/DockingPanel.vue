<script setup lang="ts">
const frameState = {
  position: 'bottom',
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
          i-carbon-open-panel-filled-bottom
          :class="frameState.position === 'bottom' ? 'text-primary' : 'op50'"
          @click="frameState.position = 'bottom'"
        />
        <button
          i- carbon-open-panel-filled-right
          :class="frameState.position === 'right' ? 'text-primary' : 'op50'"
          @click="frameState.position = 'right'"
        />
        <button
          i-carbon-open-panel-filled-left
          :class="frameState.position === 'left' ? 'text-primary' : 'op50'"
          @click="frameState.position = 'left'"
        />
        <button
          i-carbon-open-panel-filled-top
          :class="frameState.position === 'top' ? 'text-primary' : 'op50'"
          @click="frameState.position = 'top'"
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
