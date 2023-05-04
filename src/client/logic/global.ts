import type { VueDevtoolsHostClient } from './client'
import { useClient } from './client'

export interface VueDevtoolsGlobal {
  setClient(client: VueDevtoolsHostClient): void
}

export function initView() {
  const router = useRouter()

  window.__VUE_DEVTOOLS_VIEW__ = <VueDevtoolsGlobal>{
    setClient(_client) {
      const client = useClient()
      client.value = _client

      _client.hook?.on('host:inspector:close', () => {
        if (router.currentRoute.value.path === '/__inspecting')
          router.replace('/components')
      })
    },
  }
}
