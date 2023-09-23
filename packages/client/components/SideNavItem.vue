<script setup lang="ts">
import type { Tab } from '~/types'
import { useDevToolsClient } from '~/logic/client'
import { getMappedBuiltinTabs } from '~/store'

withDefaults(defineProps<{
  tab: Tab
  minimized?: boolean
}>(), {
  minimized: true,
})
const client = useDevToolsClient()
const router = useRouter()

function handleClick(tab: Tab) {
  const builtinTab = getMappedBuiltinTabs(tab)
  if (builtinTab)
    builtinTab.event?.(client.value, router)
}
</script>

<template>
  <VTooltip :disabled="!minimized" placement="right" :class="{ 'w-full': !minimized }">
    <Component
      :is="tab.path ? 'RouterLink' : 'button'"
      replace
      :to="`/${tab.path}`"
      :flex="`~ items-center ${minimized ? 'justify-center' : 'justify-between'}`"
      :w="minimized ? '10' : 'full'"
      :rounded="minimized ? 'xl' : ''"
      :p="minimized ? '1' : 'x3'"
      hover="bg-active"
      h-10 w-10 select-none items-center justify-center rounded-xl p1 text-secondary
      exact-active-class="!text-primary bg-active"
      @click="() => handleClick(tab)"
    >
      <div>
        <TabIcon
          text-xl
          :icon="tab.icon"
          :title="tab.title"
        />
        <span v-if="!minimized" ml-2 overflow-hidden text-ellipsis ws-nowrap>
          {{ tab.title }}
        </span>
      </div>
    </Component>
    <template #popper>
      <div>
        {{ tab.title }}
      </div>
    </template>
  </VTooltip>
</template>
