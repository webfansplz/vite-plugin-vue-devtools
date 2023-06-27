import { ref } from 'vue'

export function useInspector() {
  const inspectorEnabled = ref(false)
  const inspectorLoaded = ref(false)

  const enable = () => {
    window.__VUE_INSPECTOR__?.enable()
    inspectorEnabled.value = true
  }

  const disable = () => {
    window.__VUE_INSPECTOR__?.disable()
    inspectorEnabled.value = false
  }

  const setupInspector = () => {
    const componentInspector = window.__VUE_INSPECTOR__
    if (componentInspector) {
      const _openInEditor = componentInspector.openInEditor
      componentInspector.openInEditor = async (...params: any[]) => {
        disable()
        _openInEditor(...params)
      }
    }
  }

  const waitForInspectorInit = () => {
    const timer = setInterval(() => {
      if (window.__VUE_INSPECTOR__) {
        clearInterval(timer)
        inspectorLoaded.value = true
        setupInspector()
      }
    }, 30)
  }

  waitForInspectorInit()

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
