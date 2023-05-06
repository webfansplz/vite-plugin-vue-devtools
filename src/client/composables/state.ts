import { toRefs } from '@vueuse/core'

export interface DevToolsFrameState {
  route: string
  position: string
  isFirstVisit: boolean
}

const frameState = useLocalStorage<DevToolsFrameState>('__vue-devtools-frame-state__', {
  route: '/',
  position: 'bottom',
  isFirstVisit: true,
}, { mergeDefaults: true })

const frameStateRefs = toRefs(frameState)

export function useFrameState() {
  return frameStateRefs
}
