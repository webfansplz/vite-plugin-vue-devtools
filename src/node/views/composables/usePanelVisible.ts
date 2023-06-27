import { computed, onMounted } from 'vue'
import { useWindowEventListener } from '../utils'
import { popupWindow, state } from './state'

export function usePanelVisible() {
  const visible = computed({
    get() {
      return state.value.open
    },
    set(value) {
      state.value.open = value
    },
  })

  const toggleVisible = () => {
    visible.value = !visible.value
  }

  const closePanel = () => {
    if (!visible.value)
      return
    visible.value = false
    if (popupWindow.value) {
      try {
        popupWindow.value.close()
      }
      catch {}
      popupWindow.value = null
    }
  }

  onMounted(() => {
    useWindowEventListener('keydown', (e) => {
      // cmd + shift + D in <macOS>
      // alt + shift + D in <Windows>
      if (e.code === 'KeyD' && e.altKey && e.shiftKey)
        toggleVisible()
    })
  })

  return {
    panelVisible: visible,
    togglePanelVisible: toggleVisible,
    closePanel,
  }
}
