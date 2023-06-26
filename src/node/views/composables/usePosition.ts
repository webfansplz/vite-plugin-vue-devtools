import type { CSSProperties, Ref } from 'vue'
import { computed, onMounted, reactive, ref, watchEffect } from 'vue'
import { clamp, useScreenSafeArea, useWindowEventListener } from '../utils'
import { state } from './state'

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

  onMounted(() => {
    setWindowSize()

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

  return {
    isDragging,
    onPointerDown,
    isVertical,
    anchorStyle,
    iframeStyle,
  }
}
