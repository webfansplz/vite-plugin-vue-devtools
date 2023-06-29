<script setup lang="ts">
import Draggable from 'vuedraggable'
import type { AllTabGroup, Tab } from '../../types'
import { getSortedTabs, removeTabItem, updateTabsPosition } from '../store'

const props = defineProps<{
  groupName: AllTabGroup
  tabs: Tab[]
  edit: boolean
}>()

const dragging = ref(false)

const dragTabs = computed(() => getSortedTabs(props.tabs))

const removeTabItemConfirm = ref(false)

let fromGroupName: AllTabGroup = 'app'
let tabName = ''
const confirmRemoveHandlers = {
  message: '',
  handler: () => {
    removeTabItem(fromGroupName, tabName)
  },
}

function handleRemoveTabItem(_groupName: AllTabGroup, _tabName: string) {
  fromGroupName = _groupName
  tabName = _tabName
  confirmRemoveHandlers.message = `Are you sure you want to remove ${tabName} from ${fromGroupName}?`
  removeTabItemConfirm.value = true
}
</script>

<template>
  <VConfirm
    v-model="removeTabItemConfirm" :message="confirmRemoveHandlers.message"
    @confirm="confirmRemoveHandlers.handler"
  />
  <Draggable
    v-if="edit" :model-value="dragTabs" item-key="title" group="tab" :animation="200"
    class="min-h-40px flex-wrap gap3 p2 container" @update:model-value="tabs => {
      updateTabsPosition(groupName, tabs)
    }" @start="dragging = true" @end="dragging = false"
  >
    <template #item="{ element }: { element: Tab }">
      <div
        :class=" { 'hover:color-primary hover:bg-gray-2/20': !dragging } " y relative cursor-pointer rounded px2.5 py1
        transition-colors
      >
        <TabIcon
          class="hover:color-" absolute right-0 top-0 icon="i-carbon-close"
          @click=" handleRemoveTabItem(groupName, element.title) "
        />
        <VIcon :icon=" element.icon " />
        {{ element.title }}
      </div>
    </template>
  </Draggable>
  <div v-else group="tab" class="min-h-40px flex-wrap gap3 p2 container">
    <span v-for=" tab in getSortedTabs(tabs) " :key=" tab.title " y cursor-pointer rounded px2.5 py1 transition-colors>
      <VIcon :icon=" tab.icon " />
      {{ tab.title }}
    </span>
  </div>
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
