<script setup lang="ts">
import { isInPopup } from '~/logic/state'

const { sidebarExpanded } = useDevToolsSettings()
</script>

<template>
  <div>
    <div px3 py2 border="b base" flex="~ gap-2">
      <PopupButton v-if="!isInPopup" />
      <FullscreenButton v-if="!isInPopup" />
      <VDDarkToggle v-slot="{ toggle, isDark }">
        <VDButton n="sm primary" @click="toggle">
          <div carbon-sun dark:carbon-moon translate-y--1px />
          {{ isDark.value ? "Dark" : "Light" }}
        </VDButton>
      </VDDarkToggle>
      <VDButton n="sm primary" @click="sidebarExpanded = !sidebarExpanded">
        <VDIcon :icon="sidebarExpanded ? 'i-carbon-side-panel-close' : 'i-carbon-side-panel-open'" />
        {{ sidebarExpanded ? 'Minimize Sidebar' : 'Expand Sidebar' }}
      </VDButton>
      <RouterLink
        replace
        class="n-button-base active:n-button-active focus-visible:n-focus-base n-transition n-primary n-sm hover:n-button-hover n-disabled:n-disabled"
        to="/settings"
      >
        <div carbon-settings translate-y--1px />
        Settings
      </RouterLink>
    </div>
  </div>
</template>
