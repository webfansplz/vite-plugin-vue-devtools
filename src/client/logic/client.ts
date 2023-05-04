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
    on: (event: string, fn: () => void) => void
  }
}

const client = ref<VueDevtoolsHostClient>()

export function useClient() {
  return client
}
