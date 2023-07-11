import type { ComponentInternalInstance } from 'vue'

import { InstanceMap, getInstanceDetails, getInstanceName, getInstanceOrVnodeRect, getRootElementsFromComponentInstance } from '../logic/components'
import { useDevToolsClient } from '../logic/client'

export const selected = ref('vue-devtools:root')
export const selectedComponentName = ref('')
export const selectedComponentNode = ref<ComponentTreeNode>()
export const selectedComponentNodeFilePath = computed(() => selectedComponentNode.value?.instance ? getInstanceDetails(selectedComponentNode.value.instance)?.file : null)
const expandedMap = ref<Record<ComponentTreeNode['id'], boolean>>({
  'vue-devtools:root': true,
})

export const selectedComponent = ref<ComponentInternalInstance>()
export const selectedComponentState = shallowRef<Record<string, any>[]>([])
export function useComponent(instance: ComponentTreeNode & { instance?: ComponentInternalInstance }) {
  function select(data: ComponentTreeNode) {
    selected.value = data.id
    selectedComponentName.value = data.name
    // TODO (Refactor): get instance state way
    selectedComponentState.value = InstanceMap.get(data.id)
    selectedComponentNode.value = data
    // selectedComponent.value = instance.instance
    // selectedComponentState.value = getInstanceState(instance.instance!)
  }
  function toggleExpand(id: string) {
    expandedMap.value[id] = !expandedMap.value[id]
  }
  const isSelected = computed(() => selected.value === instance.id)
  const isExpanded = computed(() => expandedMap.value[instance.id])

  return { isSelected, select, isExpanded, toggleExpand }
}

export function useHighlightComponent(node: ComponentTreeNode): {
  highlight: () => void
  unhighlight: () => void
} {
  const client = useDevToolsClient()

  const highlight = useThrottleFn(() => {
    const instance = node.instance
    const bounds = getInstanceOrVnodeRect(instance)
    const name = getInstanceName(instance)
    client.value?.componentInspector.highlight(name, bounds)
  }, 300)

  const unhighlight = () => {
    client.value?.componentInspector.unHighlight()
  }

  return {
    highlight,
    unhighlight,
  }
}

scrollToComponent.timer = null
export function scrollToComponent() {
  if (scrollToComponent.timer)
    clearTimeout(scrollToComponent.timer)

  const client = useDevToolsClient()
  const { highlight, unhighlight } = useHighlightComponent(selectedComponentNode.value!)

  const instance = selectedComponentNode.value!.instance

  const [el] = getRootElementsFromComponentInstance(instance)
  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({
      behavior: 'smooth',
    })
  }
  else {
    const _bounds = getInstanceOrVnodeRect(instance)
    client.value.componentInspector.scrollToComponent(_bounds)
  }

  scrollToComponent.timer = setTimeout(() => {
    highlight()
    scrollToComponent.timer = setTimeout(() => {
      unhighlight()
      scrollToComponent.timer = null
    }, 1500)
  }, 1200)
}
