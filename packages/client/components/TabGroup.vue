<script setup lang="ts">
import type { AllTabGroup } from '../../types'
import {
  DEFAULT_TAB_GROUP, checkGroupExist,
  createGroup, removeTabGroup, resetAllTabs,
  shouldHideTabGroup, ungroupAllTabs,
} from '../store'

const groupTabs = useGroupedTabs()

const [showConfirm, toggleConfirm] = useToggle(false)

const currentRemovedGroup = ref<AllTabGroup | null>(null)
const confirmHandlers = {
  ungroup: {
    message: 'Are you sure you want to ungroup all tabs?',
    handler: ungroupAllTabs,
  },
  reset: {
    message: 'Are you sure you want to reset group?',
    handler: resetAllTabs,
  },
  remove: {
    message: 'Are you sure you want to remove this group?',
    handler: () => currentRemovedGroup.value && removeTabGroup(currentRemovedGroup.value),
  },
}
const currentConfirm = ref<keyof typeof confirmHandlers>('reset')
const currentConfirmHandlers = computed(() => confirmHandlers[currentConfirm.value])

function handleShowConfirm(confirmType: keyof typeof confirmHandlers) {
  currentConfirm.value = confirmType
  toggleConfirm(true)
}

const groupName = ref('')

function handleCreateGroup() {
  const name = groupName.value.trim()
  if (checkGroupExist(name))
    // eslint-disable-next-line no-alert
    return alert('[Vue-DevTools] Group already exist')

  createGroup(name)
  groupName.value = ''
}
</script>

<template>
  <div flex flex-wrap items-center gap-12px>
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
    <div flex gap-2>
      <VTextInput v-model="groupName" class="w-120px" />
      <VButton
        border-none bg-primary text-white hover:text-white
        :disabled="!groupName.trim().length" @click="handleCreateGroup()"
      >
        Create
      </VButton>
    </div>
  </div>
  <VConfirm v-model="showConfirm" :message="currentConfirmHandlers.message" @confirm="currentConfirmHandlers.handler" />
  <template v-for="[name, { show, tabs }] in groupTabs" :key="name">
    <div v-if="!shouldHideTabGroup(name, tabs.length) && show" mt-3>
      <div flex="~ gap-2" flex-auto items-center justify-between>
        <span capitalize op75>{{ name }}</span>
        <VIconButton
          v-if="name !== DEFAULT_TAB_GROUP"
          icon="material-symbols:delete" class="hover:color-red"
          @click="currentRemovedGroup = name; handleShowConfirm('remove')"
        />
      </div>
      <TabGroupItem
        :tabs="tabs" :group-name="name"
      />
    </div>
  </template>
</template>
