<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import type { ComponentInternalInstance } from 'vue'
import { scrollToComponent, selectComponentTreeNode, selected, selectedComponentName, selectedComponentNode, selectedComponentNodeFilePath } from '../composables/component'

/* eslint-disable @typescript-eslint/consistent-type-imports */
import { UidToTreeNodeMap } from '../logic/components/tree'
import type { ComponentTreeNode } from '~/types'
import { ComponentWalker, getInstanceState } from '~/logic/components'
import { useDevToolsClient } from '~/logic/client'
import { instance, onVueInstanceUpdate } from '~/logic/app'
import { rootPath } from '~/logic/global'
import { getUniqueComponentId } from '~/logic/components/util'

const componentTree = ref<ComponentTreeNode[]>([])
const filterName = ref('')

const componentWalker = shallowRef<ComponentWalker | null>(null)

watchDebounced(filterName, (value) => {
  value = value.trim().toLowerCase()
  componentWalker.value!.componentFilter.setFilter(value)
  componentWalker.value!.getComponentTree(instance.value!).then((res) => {
    componentTree.value = res
  })
}, { debounce: 200 })

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
  componentWalker.value = new ComponentWalker(500, null, true)
  selectedComponent.value = instance.value
  selectedComponentState.value = getInstanceState(instance.value!)
  componentWalker.value.getComponentTree(instance.value!).then((res) => {
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

function openInEditor() {
  const client = useDevToolsClient()
  client.value.openInEditor(selectedComponentNodeFilePath.value)
}

const client = useDevToolsClient()

const inspectorEnabled = ref(false)

function inspectComponentClick(instance: ComponentInternalInstance) {
  inspectorEnabled.value = false
  const treeNode = UidToTreeNodeMap.get(instance.uid)
  if (treeNode) {
    selectComponentTreeNode(treeNode)
    const walker = new ComponentWalker(0, null, false)
    const parents = walker.getComponentParents(instance)
    parents.reverse().forEach((instance) => {
      const id = getUniqueComponentId(instance)
      // Ignore root
      if (id.endsWith('root'))
        return
      setExpanded(id, true)
    })
  }
}

function toggleInspector(target?: boolean) {
  inspectorEnabled.value = target ?? !inspectorEnabled.value
  if (inspectorEnabled.value)
    client.value.componentInspector.startInspect(inspectComponentClick)

  else client.value.componentInspector.stopInspect()
}

const { control, c, escape } = useMagicKeys()

watchEffect(() => {
  if ((control.value && c.value) || (escape.value))
    toggleInspector(false)
})
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane flex flex-col border="r base">
        <div v-if="componentWalker" sticky left-0 top-0 z-300 w-full flex gap2 px10px py12px bg-base>
          <VDTextInput v-model="filterName" placeholder="Find components..." flex-1 />
          <button p2 @click="() => toggleInspector()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style="height: 1.1em; width: 1.1em; opacity:0.5;"
              :style="inspectorEnabled ? 'opacity:1;color:#00dc82' : ''"
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r=".5" fill="currentColor" /><path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" /></g>
            </svg>
          </button>
        </div>
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <ComponentTreeNode v-for="(item) in componentTree" :key="item.id" :data="item" />
        </div>
      </Pane>
      <Pane flex flex-col>
        <div v-if="normalizedComponentState.length" border="b base" flex justify-between px-4 py-2>
          <span v-if="selectedComponentName" text-sm text-primary op90>&lt;{{ selectedComponentName }}&gt;</span>
          <p flex>
            <span>
              <VTooltip placement="bottom">
                <i gg:scroll-h cursor-pointer text-xl op70 hover="op100" @click="scrollToComponent" />
                <template #popper>
                  <p text-xs op-50>
                    Scroll to component
                  </p>
                </template>
              </VTooltip>

            </span>
            <span v-if="selectedComponentNodeFilePath" pl-2>
              <VTooltip placement="bottom">
                <i carbon-launch cursor-pointer text-sm op70 hover="op100" @click="openInEditor" />
                <template #popper>
                  <p text-xs op-50>
                    Open {{ selectedComponentNodeFilePath.replace(rootPath, '') }} in editor
                  </p>
                </template>
              </VTooltip>
            </span>
          </p>
        </div>
        <div v-if="normalizedComponentState.length" h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields v-for="(item, index) in normalizedComponentState" :id="index" :key="item.key" :data="item" />
        </div>
        <VDPanelGrids v-else px5>
          <VDCard flex="~ col gap2" min-w-30 items-center p3>
            <h1 text-sm italic op50>
              No Data
            </h1>
          </VDCard>
        </VDPanelGrids>
      </Pane>
    </Splitpanes>
  </div>
</template>
