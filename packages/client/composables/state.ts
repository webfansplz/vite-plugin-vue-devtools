import { toRefs } from '@vueuse/core'
import { FRAME_STATE_STORAGE_KEY } from '../constants'

export interface DevToolsFrameState {
  width: number
  height: number
  top: number
  left: number
  open: boolean
  route: string
  position: string
  isFirstVisit: boolean
  closeOnOutsideClick: boolean
}

const frameState = useLocalStorage<DevToolsFrameState>(FRAME_STATE_STORAGE_KEY, {
  width: 80,
  height: 60,
  top: 0,
  left: 50,
  open: false,
  route: '/',
  position: 'bottom',
  isFirstVisit: true,
  closeOnOutsideClick: false,
}, { mergeDefaults: true })

const frameStateRefs = toRefs(frameState)

export function useFrameState() {
  return frameStateRefs
}
