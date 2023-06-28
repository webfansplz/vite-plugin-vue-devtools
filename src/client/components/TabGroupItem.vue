<script setup lang="ts">
import Draggable from 'vuedraggable'
import type { AllTabGroup, Tab } from '../../types'

const props = defineProps<{
  groupName: AllTabGroup
  tabs: Tab[]
}>()

const emit = defineEmits<{
  (e: 'update:tabs', v: Tab[]): void
}>()

const dragTabs = useVModel(props, 'tabs', emit, { passive: true, deep: true })

const dragging = ref(false)

const shouldHide = computed(() => props.groupName === 'ungrouped' && (!props.tabs.length))
</script>

<template>
  <div v-if="!shouldHide" mt-3>
    <div flex="~ gap-2" flex-auto items-center justify-start>
      <span capitalize op75>{{ groupName }}</span>
    </div>
    <template v-if="tabs.length">
      <Draggable
        v-model="dragTabs" item-key="title" scope="col" :animation="200"
        class="flex-wrap gap3 p2 container"
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
    <div v-else class="container" items-center justify-center p4 text-gray-3>
      Empty group
    </div>
  </div>
</template>

<style scoped>
.container {
  --at-apply: "mt2 flex border-1 border-base rounded-3";
}
</style>
