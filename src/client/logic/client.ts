import type { VueDevtoolsHostClient } from '../../types'

const client = ref<VueDevtoolsHostClient>({
  hook: window.parent?.__VUE_DEVTOOLS_GLOBAL_HOOK__,
  markClientLoaded: () => { },
  hookBuffer: [],
  categorizedHookBuffer: {},
  openInEditor: () => {},
})

export function useDevtoolsClient() {
  return client
}
