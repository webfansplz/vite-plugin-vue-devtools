import { computed, onMounted, reactive, ref, shallowRef, watchEffect } from 'vue'
import type { CSSProperties, ComponentInternalInstance, Ref } from 'vue'
import { getInstanceName } from '@vite-plugin-vue-devtools/core'
import { clamp, createDebounceFn, useObjectStorage, useScreenSafeArea, useWindowEventListener, warn } from './utils'

interface DevToolsFrameState {
  width: number
  height: number
  top: number
  left: number
  open: boolean
  route: string
  position: string
  isFirstVisit: boolean
  closeOnOutsideClick: boolean
  minimizePanelInactive: number
}

interface ComponentInspectorBounds {
  width: number
  height: number
  top: number
  left: number
}

// ---- state ----
export const PANEL_PADDING = 10
export const PANEL_MIN = 20
export const PANEL_MAX = 100

export const popupWindow = shallowRef<Window | null>(null)

export const state = useObjectStorage<DevToolsFrameState>('__vue-devtools-frame-state__', {
  width: 80,
  height: 60,
  top: 0,
  left: 50,
  open: false,
  route: '/',
  position: 'bottom',
  isFirstVisit: true,
  closeOnOutsideClick: false,
  minimizePanelInactive: 5000,
})

// ---- useIframe ----
export function useIframe(clientUrl: string, onLoad: () => void) {
  const iframe = ref<HTMLIFrameElement>()
  function getIframe() {
    if (iframe.value)
      return iframe.value
    iframe.value = document.createElement('iframe')
    iframe.value.id = 'vue-devtools-iframe'
    iframe.value.src = clientUrl
    iframe.value.setAttribute('data-v-inspector-ignore', 'true')
    iframe.value.onload = onLoad
    return iframe.value
  }

  return {
    getIframe,
    iframe,
  }
}

// ---- useInspector ----
type OpenInEditorFnFromPlugin = (baseUrl: string, filePath: string, line?: number, column?: number) => void

export function useInspector() {
  const inspectorEnabled = ref(false)
  const inspectorLoaded = ref(false)

  const enable = () => {
    window.__VUE_INSPECTOR__?.enable()
    inspectorEnabled.value = true
  }

  const disable = () => {
    window.__VUE_INSPECTOR__?.disable()
    inspectorEnabled.value = false
  }

  const openInEditor = ref< (filePath: string, line?: number, column?: number) => void>()

  const getBaseUrl = () => {
    const { protocol, hostname, port } = window.location
    return `${protocol}//${hostname}:${port}`
  }

  const registerOpenInEditor = (openInEditorFn: OpenInEditorFnFromPlugin) => {
    openInEditor.value = (filePath: string, line?: number, column?: number) => {
      openInEditorFn(getBaseUrl(), filePath, line ?? 1, column ?? 1)
    }
  }

  const setupInspector = () => {
    const componentInspector = window.__VUE_INSPECTOR__
    if (componentInspector) {
      const _openInEditor = componentInspector.openInEditor
      componentInspector.openInEditor = async (...params: any[]) => {
        disable()
        _openInEditor(...params)
      }
      registerOpenInEditor(_openInEditor)
    }
  }

  const waitForInspectorInit = () => {
    let total = 0
    const timer = setInterval(() => {
      if (window.__VUE_INSPECTOR__) {
        clearInterval(timer)
        inspectorLoaded.value = true
        setupInspector()
        total += 30
      }
      if (total >=/* 2s */ 2000) {
        clearInterval(timer)
        warn('Unable to load inspector')
      }
    }, 30)
  }

  useWindowEventListener('keydown', (e: KeyboardEvent) => {
    if (!inspectorEnabled.value || !inspectorLoaded.value)
      return
    if (e.key === 'Escape')
      disable()
  })

  waitForInspectorInit()

  return {
    toggleInspector() {
      if (!inspectorLoaded.value)
        return
      inspectorEnabled.value ? disable() : enable()
    },
    inspectorEnabled,
    enableInspector: enable,
    disableInspector: disable,
    setupInspector,
    inspectorLoaded,
    openInEditor,
    waitForInspectorInit,
  }
}

// ---- usePanelVisible ----
export function usePanelVisible() {
  const visible = computed({
    get() {
      return state.value.open
    },
    set(value) {
      state.value.open = value
    },
  })

  const toggleVisible = () => {
    visible.value = !visible.value
  }

  const closePanel = () => {
    if (!visible.value)
      return
    visible.value = false
    if (popupWindow.value) {
      try {
        popupWindow.value.close()
      }
      catch { }
      popupWindow.value = null
    }
  }

  onMounted(() => {
    useWindowEventListener('keydown', (e) => {
      // cmd + shift + D in <macOS>
      // alt + shift + D in <Windows>
      if (e.code === 'KeyD' && e.altKey && e.shiftKey)
        toggleVisible()
    })
  })

  return {
    panelVisible: visible,
    togglePanelVisible: toggleVisible,
    closePanel,
  }
}

// ---- usePipMode ----
export function usePiPMode(iframeGetter: () => HTMLIFrameElement | undefined, hook: object) {
  // Experimental: Picture-in-Picture mode
  // https://developer.chrome.com/docs/web-platform/document-picture-in-picture/
  // @ts-expect-error experimental API
  const documentPictureInPicture = window.documentPictureInPicture
  async function popup() {
    const iframe = iframeGetter()
    let isSuccess = true
    try {
      const pip = popupWindow.value = await documentPictureInPicture.requestWindow({
        width: Math.round(window.innerWidth * state.value.width / 100),
        height: Math.round(window.innerHeight * state.value.height / 100),
      })
      const style = pip.document.createElement('style')
      style.innerHTML = `
        body {
          margin: 0;
          padding: 0;
        }
        iframe {
          width: 100vw;
          height: 100vh;
          border: none;
          outline: none;
        }
      `
      pip.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook
      pip.__VUE_DEVTOOLS_IS_POPUP__ = true
      pip.document.title = 'Vue DevTools'
      pip.document.head.appendChild(style)
      pip.document.body.appendChild(iframe)
      pip.addEventListener('resize', () => {
        state.value.width = Math.round(pip.innerWidth / window.innerWidth * 100)
        state.value.height = Math.round(pip.innerHeight / window.innerHeight * 100)
      })
      pip.addEventListener('pagehide', () => {
        popupWindow.value = null
        pip.close()
      })
    }
    catch (error) {
      isSuccess = false
      console.error(`[vite-plugin-vue-devtools] Open popup mode failed: ${(error as DOMException).message}`)
    }
    return isSuccess
  }
  return {
    popup,
  }
}

// ---- usePosition ----
const SNAP_THRESHOLD = 2

function snapToPoints(value: number) {
  if (value < 5)
    return 0
  if (value > 95)
    return 100
  if (Math.abs(value - 50) < SNAP_THRESHOLD)
    return 50
  return value
}

export function usePosition(panelEl: Ref<HTMLElement | undefined>) {
  const isHovering = ref(false)
  const isDragging = ref(false)
  const draggingOffset = reactive({ x: 0, y: 0 })
  const windowSize = reactive({ width: 0, height: 0 })
  const mousePosition = reactive({ x: 0, y: 0 })
  const panelMargins = reactive({
    left: 10,
    top: 10,
    right: 10,
    bottom: 10,
  })
  let _timer: ReturnType<typeof setTimeout> | null = null

  const safeArea = useScreenSafeArea()

  watchEffect(() => {
    panelMargins.left = safeArea.left.value + 10
    panelMargins.top = safeArea.top.value + 10
    panelMargins.right = safeArea.right.value + 10
    panelMargins.bottom = safeArea.bottom.value + 10
  })

  const onPointerDown = (e: PointerEvent) => {
    isDragging.value = true
    const { left, top, width, height } = panelEl.value!.getBoundingClientRect()
    draggingOffset.x = e.clientX - left - width / 2
    draggingOffset.y = e.clientY - top - height / 2
  }

  const setWindowSize = () => {
    windowSize.width = window.innerWidth
    windowSize.height = window.innerHeight
  }

  const bringUp = () => {
    isHovering.value = true
    if (state.value.minimizePanelInactive < 0)
      return
    if (_timer)
      clearTimeout(_timer)
    _timer = setTimeout(() => {
      isHovering.value = false
    }, +state.value.minimizePanelInactive || 0)
  }

  onMounted(() => {
    setWindowSize()

    bringUp()

    useWindowEventListener('resize', () => {
      setWindowSize()
    })

    useWindowEventListener('pointerup', () => {
      isDragging.value = false
    })
    useWindowEventListener('pointerleave', () => {
      isDragging.value = false
    })
    useWindowEventListener('pointermove', (e) => {
      if (!isDragging.value)
        return

      const centerX = windowSize.width / 2
      const centerY = windowSize.height / 2

      const x = e.clientX - draggingOffset.x
      const y = e.clientY - draggingOffset.y

      mousePosition.x = x
      mousePosition.y = y

      // Get position
      const deg = Math.atan2(y - centerY, x - centerX)
      const HORIZONTAL_MARGIN = 70
      const TL = Math.atan2(0 - centerY + HORIZONTAL_MARGIN, 0 - centerX)
      const TR = Math.atan2(0 - centerY + HORIZONTAL_MARGIN, windowSize.width - centerX)
      const BL = Math.atan2(windowSize.height - HORIZONTAL_MARGIN - centerY, 0 - centerX)
      const BR = Math.atan2(windowSize.height - HORIZONTAL_MARGIN - centerY, windowSize.width - centerX)

      state.value.position = (deg >= TL && deg <= TR)
        ? 'top'
        : (deg >= TR && deg <= BR)
            ? 'right'
            : (deg >= BR && deg <= BL)
                ? 'bottom'
                : 'left'

      state.value.left = snapToPoints(x / windowSize.width * 100)
      state.value.top = snapToPoints(y / windowSize.height * 100)
    })
  })

  const isVertical = computed(() => state.value.position === 'left' || state.value.position === 'right')
  const isHidden = computed(() => {
    if (state.value.minimizePanelInactive < 0)
      return false
    if (state.value.minimizePanelInactive === 0)
      return true
    // @ts-expect-error compatibility
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    return !isDragging.value
    && !state.value.open
    && !isHovering.value
    && !isTouchDevice
    && state.value.minimizePanelInactive
  })

  const anchorPos = computed(() => {
    const halfWidth = (panelEl.value?.clientWidth || 0) / 2
    const halfHeight = (panelEl.value?.clientHeight || 0) / 2

    const left = state.value.left * windowSize.width / 100
    const top = state.value.top * windowSize.height / 100

    switch (state.value.position) {
      case 'top':
        return {
          left: clamp(left, halfWidth + panelMargins.left, windowSize.width - halfWidth - panelMargins.right),
          top: panelMargins.top + halfHeight,
        }
      case 'right':
        return {
          left: windowSize.width - panelMargins.right - halfHeight,
          top: clamp(top, halfWidth + panelMargins.top, windowSize.height - halfWidth - panelMargins.bottom),
        }
      case 'left':
        return {
          left: panelMargins.left + halfHeight,
          top: clamp(top, halfWidth + panelMargins.top, windowSize.height - halfWidth - panelMargins.bottom),
        }
      case 'bottom':
      default:
        return {
          left: clamp(left, halfWidth + panelMargins.left, windowSize.width - halfWidth - panelMargins.right),
          top: windowSize.height - panelMargins.bottom - halfHeight,
        }
    }
  })

  const anchorStyle = computed(() => ({ left: `${anchorPos.value.left}px`, top: `${anchorPos.value.top}px` }))

  const iframeStyle = computed(() => {
    // eslint-disable-next-line no-unused-expressions, no-sequences
    mousePosition.x, mousePosition.y

    const halfHeight = (panelEl.value?.clientHeight || 0) / 2

    const frameMargin = {
      left: panelMargins.left + halfHeight,
      top: panelMargins.top + halfHeight,
      right: panelMargins.right + halfHeight,
      bottom: panelMargins.bottom + halfHeight,
    }

    const marginHorizontal = frameMargin.left + frameMargin.right
    const marginVertical = frameMargin.top + frameMargin.bottom

    const maxWidth = windowSize.width - marginHorizontal
    const maxHeight = windowSize.height - marginVertical

    const style: CSSProperties = {
      zIndex: -1,
      pointerEvents: isDragging.value ? 'none' : 'auto',
      width: `min(${state.value.width}vw, calc(100vw - ${marginHorizontal}px))`,
      height: `min(${state.value.height}vh, calc(100vh - ${marginVertical}px))`,
    }

    const anchor = anchorPos.value
    const width = Math.min(maxWidth, state.value.width * windowSize.width / 100)
    const height = Math.min(maxHeight, state.value.height * windowSize.height / 100)

    const anchorX = anchor?.left || 0
    const anchorY = anchor?.top || 0

    switch (state.value.position) {
      case 'top':
      case 'bottom':
        style.left = 0
        style.transform = 'translate(-50%, 0)'
        if ((anchorX - frameMargin.left) < width / 2)
          style.left = `${width / 2 - anchorX + frameMargin.left}px`
        else if ((windowSize.width - anchorX - frameMargin.right) < width / 2)
          style.left = `${windowSize.width - anchorX - width / 2 - frameMargin.right}px`
        break
      case 'right':
      case 'left':
        style.top = 0
        style.transform = 'translate(0, -50%)'
        if ((anchorY - frameMargin.top) < height / 2)
          style.top = `${height / 2 - anchorY + frameMargin.top}px`
        else if ((windowSize.height - anchorY - frameMargin.bottom) < height / 2)
          style.top = `${windowSize.height - anchorY - height / 2 - frameMargin.bottom}px`
        break
    }

    switch (state.value.position) {
      case 'top':
        style.top = 0
        break
      case 'right':
        style.right = 0
        break
      case 'left':
        style.left = 0
        break
      case 'bottom':
      default:
        style.bottom = 0
        break
    }

    return style
  })

  const panelStyle = computed(() => {
    const style: any = {
      transform: isVertical.value
        ? `translate(${isHidden.value ? `calc(-50% ${state.value.position === 'right' ? '+' : '-'} 15px)` : '-50%'}, -50%) rotate(90deg)`
        : `translate(-50%, ${isHidden.value ? `calc(-50% ${state.value.position === 'top' ? '-' : '+'} 15px)` : '-50%'})`,
    }
    if (isHidden.value) {
      switch (state.value.position) {
        case 'top':
        case 'right':
          style.borderTopLeftRadius = '0'
          style.borderTopRightRadius = '0'
          break
        case 'bottom':
        case 'left':
          style.borderBottomLeftRadius = '0'
          style.borderBottomRightRadius = '0'
          break
      }
    }
    if (isDragging.value)
      style.transition = 'none !important'
    return style
  })

  return {
    isHidden,
    isDragging,
    isVertical,
    anchorStyle,
    iframeStyle,
    panelStyle,
    onPointerDown,
    bringUp,
  }
}

// ---- useHighlightComponent ----

export function useHighlightComponent() {
  const name = ref('')
  const overlayVisible = ref(false)
  const initialBounds = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  }
  const bounds = ref<ComponentInspectorBounds>(initialBounds)

  function highlight(_name: string, _bounds: ComponentInspectorBounds) {
    name.value = _name
    bounds.value = _bounds
    overlayVisible.value = true
  }

  function unHighlight() {
    bounds.value = initialBounds
    overlayVisible.value = false
  }

  let inspectInstance: ComponentInternalInstance | null = null
  let inspectClickCallback: ((instance: ComponentInternalInstance) => void) | null = null

  const inspectFn = (e: MouseEvent) => {
    const target = e.target as { __vueParentComponent?: ComponentInternalInstance }
    if (target) {
      const instance = target.__vueParentComponent
      if (instance) {
        const el = instance.vnode.el as HTMLElement | undefined
        if (el && el.nodeType === Node.ELEMENT_NODE) {
          inspectInstance = instance
          highlight(getInstanceName(instance), el.getBoundingClientRect())
          return
        }
      }
    }
    inspectInstance = null
  }

  const inspectClickFn = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inspectInstance) {
      inspectClickCallback!(inspectInstance)
      stopInspect()
    }
  }

  function startInspect(cb?: (instance: ComponentInternalInstance) => void) {
    if (!inspectClickCallback)
      inspectClickCallback = cb ?? (() => {})
    useWindowEventListener('mouseover', inspectFn)
    useWindowEventListener('click', inspectClickFn)
  }

  function stopInspect() {
    window.removeEventListener('mouseover', inspectFn)
    window.removeEventListener('click', inspectClickFn)
    unHighlight()
    inspectInstance = null
    inspectClickCallback = null
  }

  return {
    name,
    overlayVisible,
    bounds,
    highlight,
    unHighlight,
    startInspect,
    stopInspect,
  }
}

// use rerender highlight

interface RerenderHighlightData {
  name: string
  rerenderCount: number
  bound: {
    width: number
    height: number
    left: number
    top: number
  }
  debounceFn: () => void
}

const rerenderHighlightMap = ref<Map</* component instance uid */string, RerenderHighlightData>>(new Map())

function updateRerenderHighlightInfo(uid: string, name: string, bound: RerenderHighlightData['bound']) {
  const data = rerenderHighlightMap.value.get(uid)
  if (!data) {
    const debounceFn = createDebounceFn(() => {
      rerenderHighlightMap.value.delete(uid)
    }, 3000)
    rerenderHighlightMap.value.set(uid, {
      rerenderCount: 0,
      bound,
      debounceFn,
      name,
    })
    debounceFn()
    return
  }
  data.rerenderCount += 1
  data.debounceFn()
}

export function useRerenderHighlight() {
  return {
    rerenderHighlightMap,
    updateRerenderHighlightInfo,
  }
}
