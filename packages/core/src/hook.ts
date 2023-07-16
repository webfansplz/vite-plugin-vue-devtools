export enum DevtoolsHooks {
  APP_INIT = 'app:init',
  APP_UNMOUNT = 'app:unmount',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
  PERFORMANCE_START = 'perf:start',
  PERFORMANCE_END = 'perf:end',
}

export const devtoosHook = typeof window !== 'undefined'
  ? window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ??= {
    events: new Map<DevtoolsHooks, () => void>(),
    on(event: DevtoolsHooks, fn: () => void) {
      if (!this.events.has(event))
        this.events.set(event, [])

      this.events.get(event).push(fn)
    },
    emit(event: DevtoolsHooks, ...payload) {
      if (this.events.has(event))
        this.events.get(event).forEach(fn => fn(...payload))
    },
  }
  : {}

export function collectDevToolsHookBuffer() {
  const hookBuffer: [string, { args: any[] }][] = []
  function collect(type: DevtoolsHooks, args: { args: any[] }) {
    hookBuffer.push([type, args])
  }
  return {
    hookBuffer,
    collect,
  }
}
