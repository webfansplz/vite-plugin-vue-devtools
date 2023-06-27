import { ref } from 'vue'

export function useInspector({ onEnable, onDisable }: {
  onEnable: () => void
  onDisable: () => void
}) {
  const inspectorEnabled = ref(false)
  const inspectorLoaded = ref(false)

  const enable = () => {
    window.__VUE_INSPECTOR__?.enable()
    inspectorEnabled.value = true
    onEnable()
  }

  const disable = () => {
    window.__VUE_INSPECTOR__?.disable()
    inspectorEnabled.value = false
    onDisable()
  }

  const setupInspector = () => {
    const componentInspector = window.__VUE_INSPECTOR__
    if (componentInspector) {
      const _openInEditor = componentInspector.openInEditor
      componentInspector.openInEditor = async (...params: any[]) => {
        disable()
        _openInEditor(...params)
      }
      inspectorLoaded.value = true
    }
  }

  return {
    toggleInspector() {
      if (!inspectorLoaded.value)
        return
      inspectorEnabled.value ? disable() : enable()
    },
    inspectorEnabled,
    enableInspector: enable,
    disableInspector: disable,
    setupInspector,
    inspectorLoaded,
  }
}
