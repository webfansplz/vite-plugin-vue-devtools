import { shallowRef } from 'vue'
import type { DevToolsFrameState } from '../../../client/composables/state'
import { useObjectStorage } from '../utils'
import { FRAME_STATE_STORAGE_KEY } from '../../../client/constants'

export const PANEL_PADDING = 10
export const PANEL_MIN = 20
export const PANEL_MAX = 100

export const popupWindow = shallowRef<Window | null>(null)

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
