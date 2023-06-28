<script setup lang="ts">
import type { BuiltinTab } from '../../types'

const props = defineProps<{
  groupName: string
  tabs: BuiltinTab[]
}>()
</script>

<template>
  <div>
    <div flex="~ gap-2" flex-auto items-center justify-start>
      <span capitalize op75>{{ groupName }}</span>
    </div>
  </div>
</template>
