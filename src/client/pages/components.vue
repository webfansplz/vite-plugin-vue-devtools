<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'

import { ComponentWalker, getInstanceState } from '../logic/components'
import { instance, onVueInstanceUpdate } from '../logic/app'
import { scrollToComponent, selected, selectedComponentName, selectedComponentNode } from '../composables/component'

const componentTree = ref<ComponentTreeNode[]>([])

function normalizeComponentState(value: unknown, type: string) {
  if (type === 'Reactive')
    return reactive(value as object)

  else if (type === 'Computed')
    return computed(() => value)

  else if (type === 'Ref')
    return ref(value)

  else
    return value
}

const normalizedComponentState = computed(() => {
  const list: { key: string;value: Record<string, unknown> }[] = []
  selectedComponentState.value.forEach((item) => {
    if (list.some(i => i.key === item.type)) {
      const index = list.findIndex(i => i.key === item.type)
      list[index].value = {
        ...list[index].value,
        [item.key]: normalizeComponentState(item.value, item.objectType),
      }
    }
    else {
      list.push({
        key: item.type,
        value: {
          [item.key]: normalizeComponentState(item.value, item.objectType),
        },
      })
    }
  })
  return list
})

function init() {
  const walker = new ComponentWalker(500, null, true)
  selectedComponent.value = instance.value
  selectedComponentState.value = getInstanceState(instance.value!)
  walker.getComponentTree(instance.value!).then((res) => {
    componentTree.value = res
    selectedComponentName.value = res?.[0]?.name ?? ''
    selectedComponentNode.value = res?.[0]
  })
}

onMounted(() => {
  onVueInstanceUpdate((v) => {
    if (v) {
      init()
      selected.value = 'vue-devtools:root'
    }
  })
})
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <ComponentTreeNode v-for="(item) in componentTree" :key="item.id" :data="item" />
        </div>
      </Pane>
      <Pane>
        <div border="b base" flex justify-between p-2>
          <span v-if="selectedComponentName" text-sm text-primary op90>&lt;{{ selectedComponentName }}&gt;</span>
          <span>
            <VTooltip placement="bottom">
              <i gg:scroll-h cursor-pointer text-xl hover="text-primary" @click="scrollToComponent" />
              <template #popper>
                <p text-xs op-50>
                  Scroll to component
                </p>
              </template>
            </VTooltip>

          </span>
        </div>
        <div v-if="normalizedComponentState.length" h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields v-for="(item, index) in normalizedComponentState" :id="index" :key="item.key" :data="item" />
        </div>
        <VPanelGrids v-else px5>
          <VCard flex="~ col gap2" min-w-30 items-center p3>
            <h1 text-sm italic op50>
              No Data
            </h1>
          </VCard>
        </VPanelGrids>
      </Pane>
    </Splitpanes>
  </div>
</template>
