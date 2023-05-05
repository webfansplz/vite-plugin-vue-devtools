import { toRefs } from '@vueuse/core'

export interface DevToolsFrameState {
  route: string
}

const frameState = useLocalStorage<DevToolsFrameState>('__vue-devtools-frame-state__', {
  route: '/overview',
}, { mergeDefaults: true })

const frameStateRefs = toRefs(frameState)

export function useFrameState() {
  return frameStateRefs
}
