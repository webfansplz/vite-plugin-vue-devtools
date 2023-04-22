import type { ComponentInternalInstance } from 'vue'

// import { getInstanceState } from '../../node/components/data'

const selected = ref('vue-devtools:root')
const expandedMap = ref<Record<ComponentTreeNode['id'], boolean>>({
  'vue-devtools:root': true,
})
export const selectedComponent = ref<ComponentInternalInstance>()
export const selectedComponentState = shallowRef<Record<string, any>[]>([])
export function useComponent(instance: ComponentTreeNode) {
  function select(id: string) {
    selected.value = id
    // selectedComponent.value = instance
  }
  function toggleExpand(id: string) {
    expandedMap.value[id] = !expandedMap.value[id]
  }
  const isSelected = computed(() => selected.value === instance.id)
  const isExpanded = computed(() => expandedMap.value[instance.id])

  return { isSelected, select, isExpanded, toggleExpand }
}
