import { getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'

// ---- screen ----

// ---- storage ----
export function useObjectStorage<T>(key: string, initial: T, readonly = false): Ref<T> {
  const raw = localStorage.getItem(key)
  const data = ref(raw ? JSON.parse(raw) : initial)

  for (const key in initial) {
    if (data.value[key] === undefined)
      data.value[key] = initial[key]
  }

  let updating = false
  let wrote = ''

  if (!readonly) {
    watch(data, (value) => {
      if (updating)
        return
      wrote = JSON.stringify(value)
      localStorage.setItem(key, wrote)
    }, { deep: true, flush: 'post' })
  }

  useWindowEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue && e.newValue !== wrote) {
      updating = true
      data.value = JSON.parse(e.newValue)
      updating = false
    }
  })

  return data
}

export function useStorage<T>(key: string, initial: T, readonly = false) {
  const raw = localStorage.getItem(key)
  const data = ref(raw || initial)

  let updating = false
  let wrote = ''

  if (!readonly) {
    watch(data, (value) => {
      if (updating)
        return
      wrote = `${value}`
      localStorage.setItem(key, wrote)
    }, { deep: true, flush: 'post' })
  }

  useWindowEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue && e.newValue !== wrote) {
      updating = true
      data.value = e.newValue
      updating = false
    }
  })

  return data
}

// ---- index ----
export const checkIsSafari = () => navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
export const useColorScheme = () => useStorage('vueuse-color-scheme', 'auto', true)

// ---- event ----
export function useEventListener(
  target: EventTarget,
  type: keyof WindowEventHandlersEventMap,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  target.addEventListener(type, listener, options)
  getCurrentScope() && onScopeDispose(() => target.removeEventListener(type, listener, options))
}

export function useWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  useEventListener(window, type as keyof WindowEventHandlersEventMap, listener as EventListener, options)
}

const topVarName = '--vite-plugin-vue-devtools-safe-area-top'
const rightVarName = '--vite-plugin-vue-devtools-devtools-safe-area-right'
const bottomVarName = '--vite-plugin-vue-devtools-safe-area-bottom'
const leftVarName = '--vite-plugin-vue-devtools-safe-area-left'

/**
 * Reactive `env(safe-area-inset-*)`
 *
 * @see https://vueuse.org/useScreenSafeArea
 */
export function useScreenSafeArea() {
  const top = ref(0)
  const right = ref(0)
  const bottom = ref(0)
  const left = ref(0)

  document.documentElement.style.setProperty(topVarName, 'env(safe-area-inset-top, 0px)')
  document.documentElement.style.setProperty(rightVarName, 'env(safe-area-inset-right, 0px)')
  document.documentElement.style.setProperty(bottomVarName, 'env(safe-area-inset-bottom, 0px)')
  document.documentElement.style.setProperty(leftVarName, 'env(safe-area-inset-left, 0px)')

  update()
  useWindowEventListener('resize', update)

  function getValue(position: string) {
    return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(position)) || 0
  }

  function update() {
    top.value = getValue(topVarName)
    right.value = getValue(rightVarName)
    bottom.value = getValue(bottomVarName)
    left.value = getValue(leftVarName)
  }

  return {
    top,
    right,
    bottom,
    left,
    update,
  }
}
