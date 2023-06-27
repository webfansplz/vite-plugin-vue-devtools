import { ref } from 'vue'

export function useInspector({ onEnable, onDisable }: {
  onEnable: () => void
  onDisable: () => void
}) {
  const inspectorEnabled = ref(false)

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

  return {
    toggleInspector() {
      inspectorEnabled.value ? disable() : enable()
    },
    inspectorEnabled,
    enableInspector: enable,
    disableInspector: disable,
  }
}
