import { onMounted, ref } from 'vue'
import { useWindowEventListener } from '../utils'
import { state } from './state'

export function usePanelVisible() {
  const visible = ref(false)

  const toggleVisible = () => {
    visible.value = !visible.value
    state.value.open = visible.value
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
  }
}
