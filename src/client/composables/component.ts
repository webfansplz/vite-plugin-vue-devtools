import type { ComponentInternalInstance } from 'vue'
import { InstanceMap } from '../../node/components/tree'

// import { getInstanceState } from '../../node/components/data'

export const selected = ref('vue-devtools:root')
const expandedMap = ref<Record<ComponentTreeNode['id'], boolean>>({
  'vue-devtools:root': true,
})
export const selectedComponent = ref<ComponentInternalInstance>()
export const selectedComponentState = shallowRef<Record<string, any>[]>([])
export function useComponent(instance: ComponentTreeNode & { instance?: ComponentInternalInstance }) {
  function select(id: string) {
    selected.value = id
    // TODO (Refactor): get instance state way
    selectedComponentState.value = InstanceMap.get(id)
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
