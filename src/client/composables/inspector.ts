import { getCurrentScope, onScopeDispose, computed, onMounted, reactive, ref, shallowRef, watchEffect } from 'vue'
import type { OpenInEditorFn } from "../../types"

export function warn(message: string) {
  console.warn(`[vite-plugin-vue-devtools] ${message}`)
}

export function tryOnScopeDispose(fn: () => void) {
  const scope = getCurrentScope()
  if (scope)
    onScopeDispose(fn)
}

// ---- event ----
export function useEventListener(
  target: EventTarget,
  type: keyof WindowEventHandlersEventMap,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  target.addEventListener(type, listener, options)
  tryOnScopeDispose(() => target.removeEventListener(type, listener, options))
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
