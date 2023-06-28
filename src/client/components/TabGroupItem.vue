<script setup lang="ts">
import Draggable from 'vuedraggable'
import type { BuiltinTab } from '../../types'

const props = defineProps<{
  groupName: string
  tabs: BuiltinTab[]
}>()

const emit = defineEmits<{
  (e: 'update:tabs', v: BuiltinTab[]): void
}>()

const dragTabs = useVModel(props, 'tabs', emit, { passive: true, deep: true })

const dragging = ref(false)
</script>

<template>
  <div mt-3>
    <div flex="~ gap-2" flex-auto items-center justify-start>
      <span capitalize op75>{{ groupName }}</span>
    </div>
    <Draggable
      v-model="dragTabs" item-key="title" scope="col" :animation="200"
      class="mt-2 flex flex-wrap gap3 border-1 border-base rounded-3 p2"
      @start="dragging = true" @end="dragging = false"
    >
      <template #item="{ element }: { element: BuiltinTab }">
        <div :class="{ 'hover:color-primary hover:bg-gray-2/20': !dragging }" y cursor-pointer rounded px2 py1 transition-colors>
          <VIcon :icon="element.icon" />
          {{ element.title }}
        </div>
      </template>
    </Draggable>
  </div>
</template>
