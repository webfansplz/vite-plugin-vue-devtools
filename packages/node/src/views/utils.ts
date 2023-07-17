import {
  computed, getCurrentScope, onScopeDispose, ref, watch, watchEffect,
} from 'vue'
import type { Ref } from 'vue'

export function tryOnScopeDispose(fn: () => void) {
  const scope = getCurrentScope()
  if (scope)
    onScopeDispose(fn)
}

export function warn(message: string) {
  console.warn(`[vite-plugin-vue-devtools] ${message}`)
}

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

  const storageChanged = (newValue: string) => {
    updating = true
    data.value = JSON.parse(newValue)
    updating = false
  }

  useWindowEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue && e.newValue !== wrote)
      storageChanged(e.newValue)
  })

  // @ts-expect-error custom event
  useWindowEventListener('vueuse-storage', (e: CustomEvent) => {
    const event = e.detail as StorageEvent
    if (event.key === key && event.newValue && event.newValue !== wrote)
      storageChanged(event.newValue)
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

  const storageChanged = (newValue: string) => {
    updating = true
    data.value = newValue
    updating = false
  }

  useWindowEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue && e.newValue !== wrote)
      storageChanged(e.newValue)
  })

  // @ts-expect-error custom event
  useWindowEventListener('vueuse-storage', (e: CustomEvent) => {
    const event = e.detail as StorageEvent
    if (event.key === key && event.newValue && event.newValue !== wrote)
      storageChanged(event.newValue)
  })

  return data
}

// ---- index ----
export const checkIsSafari = () => navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
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

// ---- screen ----
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

// color-scheme
export const useColorScheme = () => useStorage('vueuse-color-scheme', 'auto', true)

/**
 * Reactive Media Query.
 *
 * @see https://vueuse.org/useMediaQuery
 * @param query
 * @param options
 */
export function useMediaQuery(query: string) {
  const isSupported = () => window && 'matchMedia' in window && typeof window.matchMedia === 'function'

  let mediaQuery: MediaQueryList | undefined
  const matches = ref(false)

  const cleanup = () => {
    if (!mediaQuery)
      return
    if ('removeEventListener' in mediaQuery)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      mediaQuery.removeEventListener('change', update)
    else
      // @ts-expect-error deprecated API
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      mediaQuery.removeListener(update)
  }

  const update = () => {
    if (!isSupported)
      return

    cleanup()

    mediaQuery = window!.matchMedia(ref(query).value)
    matches.value = !!mediaQuery?.matches

    if (!mediaQuery)
      return

    if ('addEventListener' in mediaQuery)
      mediaQuery.addEventListener('change', update)
    else
      // @ts-expect-error deprecated API
      mediaQuery.addListener(update)
  }
  watchEffect(update)

  tryOnScopeDispose(() => cleanup())

  return matches
}
/**
 * Reactive prefers-color-scheme media query.
 *
 * @see https://vueuse.org/usePreferredColorScheme
 * @param [options]
 */
export function usePreferredColorScheme() {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)')

  return computed(() => isDark.value ? 'dark' : 'light')
}
