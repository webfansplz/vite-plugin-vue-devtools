<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { ComponentWalker } from '../../node/components/tree'
import { getInstanceState } from '../../node/components/data'

const componentTree = ref<ComponentTreeNode[]>([])

const normalizedComponentState = computed(() => {
  const list: any = []
  selectedComponentState.value.forEach((item) => {
    if (list.some((i: any) => i.type === item.type)) {
      const index = list.findIndex((i: any) => i.type === item.type)
      list[index].data.push(item)
    }
    else {
      list.push({
        type: item.type,
        data: [item],
      })
    }
  })
  return list
})

function init() {
  const walker = new ComponentWalker(500, null, true)
  const instance = window.parent.__VUE_DEVTOOLS_GET_VUE_INSTANCE__()
  selectedComponent.value = instance
  selectedComponentState.value = getInstanceState(instance)
  walker.getComponentTree(instance).then((res) => {
    componentTree.value = res
  })
}

onMounted(() => {
  init()
  window.addEventListener('message', (e) => {
    if (e.data === 'update')
      init()
  })
})
</script>

<template>
  <div>
    <Splitpanes>
      <Pane border="r base">
        <div p-2>
          <ComponentTreeNode v-for="(item) in componentTree" :key="item.id" :data="item" />
        </div>
      </Pane>
      <Pane>
        <div p-2>
          <ComponentState v-for="(item) in normalizedComponentState" :key="item.id" :data="item" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
