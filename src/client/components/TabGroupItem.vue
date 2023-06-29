<script setup lang="ts">
import Draggable from 'vuedraggable'
import type { AllTabGroup, Tab } from '../../types'
import { getSortedTabs, updateTabsPosition } from '../store'

const props = defineProps<{
  groupName: AllTabGroup
  tabs: Tab[]
}>()

const dragging = ref(false)

const dragTabs = computed(() => getSortedTabs(props.tabs))
</script>

<template>
  <Draggable
    :model-value="dragTabs"
    item-key="title"
    group="tab" :animation="200" class="min-h-40px flex-wrap gap3 p2 container"
    @update:model-value="tabs => {
      updateTabsPosition(groupName, tabs)
    }"
    @start="dragging = true" @end="dragging = false"
  >
    <template #item="{ element }: { element: Tab }">
      <div :class="{ 'hover:color-primary hover:bg-gray-2/20': !dragging }" y cursor-pointer rounded px2 py1 transition-colors>
        <VIcon :icon="element.icon" />
        {{ element.title }}
      </div>
    </template>
  </Draggable>
</template>

<style scoped>
.container {
  --at-apply: "mt2 flex border-1 border-base rounded-3";
}

.container:empty {
  padding: 0.8rem;
  text-align: center;
}

.container:empty:before {
  content: 'Empty group';
}
</style>
