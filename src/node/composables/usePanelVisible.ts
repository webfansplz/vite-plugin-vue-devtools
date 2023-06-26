import { onMounted, ref } from 'vue'

export function usePanelVisible() {
  const visible = ref(false)

  const toggleVisible = () => {
    visible.value = !visible.value
  }
  onMounted(() => {
    window.addEventListener('keydown', (e) => {
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
