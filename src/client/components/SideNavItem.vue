<script setup lang="ts">
import type { BuiltinTab } from '../../types'
import { useDevtoolsClient } from '../logic/client'

defineProps<{
  tab: BuiltinTab
}>()
const client = useDevtoolsClient()
const router = useRouter()
</script>

<template>
  <VTooltip v-if="!tab.hidden" placement="right">
    <Component
      :is="tab.path ? 'RouterLink' : 'button'"
      replace
      :to="`/${tab.path}`"
      flex="~"
      hover="bg-active"
      h-10 w-10 select-none items-center justify-center rounded-xl p1 text-secondary
      exact-active-class="!text-primary bg-active"
      @click="tab.event?.(client, router)"
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
