import { getCurrentScope, onScopeDispose } from 'vue'

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
