import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import type { ComponentInspectorBounds, OpenInEditorFn } from "../../types"

export function warn(message: string) {
  console.warn(`[vite-plugin-vue-devtools] ${message}`)
}

export function useWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  useEventListener(window, type as keyof WindowEventHandlersEventMap, listener as EventListener, options)
}

// ---- useInspector ----
type OpenInEditorFnFromPlugin = (baseUrl: string, filePath: string, line?: number, column?: number) => any

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

  const openInEditor = ref<OpenInEditorFn>()

  const getBaseUrl = () => {
    const { protocol, hostname, port } = window.location
    return `${protocol}//${hostname}:${port}`
  }

  const registerOpenInEditor = (openInEditorFn: OpenInEditorFnFromPlugin) => {
    openInEditor.value = (filePath: string, line?: number, column?: number) => {
      openInEditorFn(getBaseUrl(), filePath, line ?? 1, column ?? 1)
    }
  }

  const setupInspector = () => {
    const componentInspector = window.__VUE_INSPECTOR__
    if (componentInspector) {
      const _openInEditor = componentInspector.openInEditor
      componentInspector.openInEditor = async (...params: any[]) => {
        disable()
        _openInEditor(...params)
      }
      registerOpenInEditor(_openInEditor)
    }
  }

  const waitForInspectorInit = () => {
    let total = 0
    const timer = setInterval(() => {
      if (window.__VUE_INSPECTOR__) {
        clearInterval(timer)
        inspectorLoaded.value = true
        setupInspector()
        total += 30
      }
      if (total >=/* 2s */ 2000) {
        clearInterval(timer)
        warn('Unable to load inspector')
      }
    }, 30)
  }

  useWindowEventListener('keydown', (e: KeyboardEvent) => {
    if (!inspectorEnabled.value || !inspectorLoaded.value)
      return
    if (e.key === 'Escape')
      disable()
  })

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
    openInEditor,
    waitForInspectorInit,
  }
}

// ---- useHighlightComponent ----

export function useHighlightComponent() {
  const name = ref('')
  const overlayVisible = ref(false)
  const initialBounds = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  }
  const bounds = ref<ComponentInspectorBounds>(initialBounds)

  function highlight(_name: string, _bounds: ComponentInspectorBounds) {
    name.value = _name
    bounds.value = _bounds
    overlayVisible.value = true
  }

  function unHighlight() {
    bounds.value = initialBounds
    overlayVisible.value = false
  }

  return {
    name,
    overlayVisible,
    bounds,
    highlight,
    unHighlight,
  }
}
