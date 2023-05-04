export interface VueDevtoolsHostClient {
  inspector?: {
    enable: () => void
    disable: () => void
  }
  panel?: {
    toggle: (position: string) => void
  }
  hook?: {
    events: Map<string, () => void>
    emit: (event: string, ...payload: any[]) => void
    on: (event: string, fn: (...payload: any[]) => void) => void
  }
  hookQueue: [string, number, any[], number][]
}

const client = ref<VueDevtoolsHostClient>({
  hook: window.parent.__VUE_DEVTOOLS_GLOBAL_HOOKS__(),
  hookQueue: [],
})

export function useClient() {
  return client
}
