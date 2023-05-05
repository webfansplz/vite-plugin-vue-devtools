import type { VueDevtoolsHostClient } from '../../types'
import { useClient } from './client'
import { init as initTimeline } from './timeline'

export interface VueDevtoolsGlobal {
  setClient(client: VueDevtoolsHostClient): void
}

export function initClient() {
  window.__VUE_DEVTOOLS_VIEW__ = <VueDevtoolsGlobal>{
    setClient(_client) {
      const client = useClient()
      client.value = _client
      initTimeline(client.value.hookQueue.filter(([type]) => type.startsWith('perf:')))
    },
  }
}

export function initGlobalHook() {
  const router = useRouter()
  const route = useRoute()
  const client = useClient()
  const frameState = useFrameState()

  client.value.hook?.on('host:inspector:close', () => {
    if (route.path === '/__inspecting')
      router.replace(frameState.route.value)
  })
}
