import { toRefs } from '@vueuse/core'

export interface DevToolsFrameState {
  route: string
  position: string
  isFirstVisit: boolean
  closeOnOutsideClick: boolean
}

const frameState = useLocalStorage<DevToolsFrameState>('__vue-devtools-frame-state__', {
  route: '/',
  position: 'bottom',
  isFirstVisit: true,
  closeOnOutsideClick: false,
}, { mergeDefaults: true })

const frameStateRefs = toRefs(frameState)

export function useFrameState() {
  return frameStateRefs
}
