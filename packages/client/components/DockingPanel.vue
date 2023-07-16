<script setup lang="ts">
import { isInPopup } from '~/logic/state'
</script>

<template>
  <div>
    <div px3 py2 border="b base" flex="~ gap-2">
      <PopupButton v-if="!isInPopup" />
      <VDarkToggle v-slot="{ toggle, isDark }">
        <VButton n="sm primary" @click="toggle">
          <div carbon-sun translate-y--1px dark:carbon-moon />
          {{ isDark.value ? "Dark" : "Light" }}
        </VButton>
      </VDarkToggle>
      <RouterLink
        replace
        class="n-disabled:n-disabled n-button-base n-transition n-primary n-sm active:n-button-active focus-visible:n-focus-base hover:n-button-hover"
        to="/settings"
      >
        <div carbon-settings translate-y--1px />
        Settings
      </RouterLink>
    </div>
  </div>
</template>
