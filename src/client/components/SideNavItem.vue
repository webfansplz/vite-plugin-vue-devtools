<script setup lang="ts">
import type { Tab } from '../../types'
import { useDevToolsClient } from '../logic/client'
import { getMappedBuiltinTabs } from '../store'

defineProps<{
  tab: Tab
}>()
const client = useDevToolsClient()
const router = useRouter()

function handleClick(tab: Tab) {
  const builtinTab = getMappedBuiltinTabs(tab)
  if (builtinTab)
    builtinTab.event?.(client.value, router)
}
</script>

<template>
  <VTooltip placement="right">
    <Component
      :is="tab.path ? 'RouterLink' : 'button'"
      replace
      :to="`/${tab.path}`"
      flex="~"
      hover="bg-active"
      h-10 w-10 select-none items-center justify-center rounded-xl p1 text-secondary
      exact-active-class="!text-primary bg-active"
      @click="() => handleClick(tab)"
    >
      <TabIcon
        text-xl
        :icon="tab.icon" :title="tab.title"
      />
    </Component>
    <template #popper>
      <div>
        {{ tab.title }}
      </div>
    </template>
  </VTooltip>
</template>
