import type { DevToolsFrameState } from '../../../client/composables/state'
import { useObjectStorage } from '../utils'
import { FRAME_STATE_STORAGE_KEY } from '../../../client/constants'

export const state = useObjectStorage<DevToolsFrameState>(FRAME_STATE_STORAGE_KEY, {
  width: 80,
  height: 60,
  top: 0,
  left: 50,
  open: false,
  route: '/',
  position: 'bottom',
  isFirstVisit: true,
  closeOnOutsideClick: false,
})
