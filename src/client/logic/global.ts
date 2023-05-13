import type { VueDevtoolsHostClient } from '../../types'
import { useDevtoolsClient } from './client'
import { initApp } from './app'

export interface VueDevtoolsGlobal {
  loaded: boolean
  setClient(client: VueDevtoolsHostClient): void
}

export function createDevToolsClient() {
  window.__VUE_DEVTOOLS_VIEW__ = <VueDevtoolsGlobal>{
    loaded: false,
    setClient(_client) {
      const client = useDevtoolsClient()
      client.value = _client
      client.value.markClientLoaded = () => {
        this.loaded = true
      }
      initApp(client.value.hookBuffer.find(([type]) => type === 'app:init'))
    },
  }
}
