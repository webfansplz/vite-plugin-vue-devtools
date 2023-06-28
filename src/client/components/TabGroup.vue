<script setup lang="ts">
import { resetAllTabs, ungroupAllTabs } from '../store'

const groupTabs = useGroupedTabs()

const [showConfirm, toggleConfirm] = useToggle(false)

const confirmHandlers = {
  ungroup: {
    message: 'Are you sure you want to ungroup all tabs?',
    handler: ungroupAllTabs(),
  },
  reset: {
    message: 'Are you sure you want to reset group?',
    handler: resetAllTabs,
  },
}
const currentConfirm = ref<keyof typeof confirmHandlers>('reset')
const currentConfirmHandlers = computed(() => confirmHandlers[currentConfirm.value])

function handleShowConfirm(confirmType: keyof typeof confirmHandlers) {
  currentConfirm.value = confirmType
  toggleConfirm(true)
}
</script>

<template>
  <div flex items-center gap-12px>
    <VButton n="primary" @click.prevent="handleShowConfirm('reset')">
      <div i-material-symbols:360 />
      Reset group
    </VButton>
    <VButton
      n="primary" @click.prevent="handleShowConfirm('ungroup')"
    >
      <div i-material-symbols-ungroup />
      Ungroup all tabs
    </VButton>
  </div>
  <VConfirm v-model="showConfirm" :message="currentConfirmHandlers.message" @confirm="currentConfirmHandlers.handler" />
  <TabGroupItem
    v-for="[name, tabs] in groupTabs" :key="name" :tabs="tabs" :group-name="name"
  />
</template>
