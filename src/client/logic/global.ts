import type { VueDevtoolsHostClient } from '../../types'
import { useDevToolsClient } from './client'
import { initApp } from './app'

export interface VueDevtoolsGlobal {
  loaded: boolean
  setClient(client: VueDevtoolsHostClient): void
}

function normalizeHookBuffer(buffer: VueDevtoolsHostClient['hookBuffer']) {
  return buffer.reduce((box, [type, ...args]) => {
    const categoryName = type.split(':')[0];
    (box[categoryName] ??= []).push([type, ...args])
    return box
  }, {})
}

export function createDevToolsClient() {
  window.__VUE_DEVTOOLS_VIEW__ = <VueDevtoolsGlobal>{
    loaded: false,
    setClient(_client) {
      const client = useDevToolsClient()
      client.value = _client
      client.value.markClientLoaded = () => {
        this.loaded = true
      }
      client.value.categorizedHookBuffer = normalizeHookBuffer(client.value.hookBuffer)
      initApp(client.value.categorizedHookBuffer.app?.[0] ?? [])
    },
  }
}
