<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { PANEL_MAX, PANEL_MIN, popupWindow, state } from './composables'
import { useWindowEventListener } from './utils'

const props = defineProps<{
  isDragging: boolean

  client: {
    close: () => void
    getIFrame: () => HTMLIFrameElement
    inspector: {
      isEnabled: Ref<boolean>
      disable: () => void
    } | undefined
  }

  viewMode: 'default' | 'xs'
}>()

const container = ref<HTMLElement>()
const isResizing = ref<false | { top?: boolean; left?: boolean; right?: boolean; bottom?: boolean }>(false)

watchEffect(() => {
  if (!container.value)
    return
  if (state.value.open) {
    const iframe = props.client.getIFrame()
    iframe.style.pointerEvents = (isResizing.value || props.isDragging) ? 'none' : 'auto'

    if (!popupWindow.value) {
      if (Array.from(container.value.children).every(el => el !== iframe))
        container.value.appendChild(iframe)
    }
  }
})

useWindowEventListener('keydown', (e) => {
  if (e.key === 'Escape' && props.client.inspector?.isEnabled.value) {
    e.preventDefault()
    props.client.inspector?.disable()
    props.client.close()
  }
})

useWindowEventListener('mousedown', (e: MouseEvent) => {
  if (!state.value.closeOnOutsideClick)
    return
  if (popupWindow.value)
    return
  if (!state.value.open || isResizing.value || props.client.inspector?.isEnabled.value)
    return

  const matched = e.composedPath().find((_el) => {
    const el = _el as HTMLElement
    return Array.from(el.classList || []).some(c => c.startsWith('vue-devtools-'))
      || el.tagName?.toLowerCase() === 'iframe'
  })

  if (!matched)
    state.value.open = false
})

useWindowEventListener('mousemove', (e) => {
  if (!isResizing.value)
    return
  if (!state.value.open)
    return

  const iframe = props.client.getIFrame()
  const box = iframe.getBoundingClientRect()

  if (isResizing.value.right) {
    const widthPx = Math.abs(e.clientX - (box?.left || 0))
    const width = widthPx / window.innerWidth * 100
    state.value.width = Math.min(PANEL_MAX, Math.max(PANEL_MIN, width))
  }
  else if (isResizing.value.left) {
    const widthPx = Math.abs((box?.right || 0) - e.clientX)
    const width = widthPx / window.innerWidth * 100
    state.value.width = Math.min(PANEL_MAX, Math.max(PANEL_MIN, width))
  }

  if (isResizing.value.top) {
    const heightPx = Math.abs((box?.bottom || 0) - e.clientY)
    const height = heightPx / window.innerHeight * 100
    state.value.height = Math.min(PANEL_MAX, Math.max(PANEL_MIN, height))
  }
  else if (isResizing.value.bottom) {
    const heightPx = Math.abs(e.clientY - (box?.top || 0))
    const height = heightPx / window.innerHeight * 100
    state.value.height = Math.min(PANEL_MAX, Math.max(PANEL_MIN, height))
  }
})

useWindowEventListener('mouseup', () => {
  isResizing.value = false
})

useWindowEventListener('mouseleave', () => {
  isResizing.value = false
})
</script>

<template>
  <div
    v-show="state.open && !client.inspector?.isEnabled.value && !popupWindow"
    ref="container"
    class="vue-devtools-frame"
    :class="{ 'view-mode-xs': props.viewMode === 'xs' }"
  >
    <!-- Handlers -->
    <div
      v-show="state.position !== 'top'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-horizontal"
      :style="{ top: 0 }"
      @mousedown.prevent="() => isResizing = { top: true }"
    />
    <div
      v-show="state.position !== 'bottom'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-horizontal"
      :style="{ bottom: 0 }"
      @mousedown.prevent="() => isResizing = { bottom: true }"
    />
    <div
      v-show="state.position !== 'left'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-vertical"
      :style="{ left: 0 }"
      @mousedown.prevent="() => isResizing = { left: true }"
    />
    <div
      v-show="state.position !== 'right'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-vertical"
      :style="{ right: 0 }"
      @mousedown.prevent="() => isResizing = { right: true }"
    />
    <div
      v-show="state.position !== 'top' && state.position !== 'left'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
      :style="{ top: 0, left: 0, cursor: 'nwse-resize' }"
      @mousedown.prevent="() => isResizing = { top: true, left: true }"
    />
    <div
      v-show="state.position !== 'top' && state.position !== 'right'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
      :style="{ top: 0, right: 0, cursor: 'nesw-resize' }"
      @mousedown.prevent="() => isResizing = { top: true, right: true }"
    />
    <div
      v-show="state.position !== 'bottom' && state.position !== 'left'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
      :style="{ bottom: 0, left: 0, cursor: 'nesw-resize' }"
      @mousedown.prevent="() => isResizing = { bottom: true, left: true }"
    />
    <div
      v-show="state.position !== 'bottom' && state.position !== 'right'"
      class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
      :style="{ bottom: 0, right: 0, cursor: 'nwse-resize' }"
      @mousedown.prevent="() => isResizing = { bottom: true, right: true }"
    />
  </div>
</template>

<style scoped>
.vue-devtools-frame {
  position: fixed;
  z-index: 2147483645;
}

.vue-devtools-frame :deep(iframe) {
  width: 100%;
  height: 100%;
  outline: none;
  background: var(--vue-devtools-widget-bg);
  border: 1px solid rgba(125,125,125,0.2);
  border-radius: 10px;
}

.vue-devtools-resize-handle-horizontal {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 10px;
  margin: -5px 0;
  cursor: ns-resize;
  border-radius: 5px;
}
.vue-devtools-resize-handle-vertical {
  position: absolute;
  top: 6px;
  bottom: 0;
  width: 10px;
  margin: 0 -5px;
  cursor: ew-resize;
  border-radius: 5px;
}
.vue-devtools-resize-handle-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -6px;
  border-radius: 6px;
}
.vue-devtools-resize-handle:hover {
  background: rgba(125,125,125,0.1);
}

.vue-devtools-frame.view-mode-xs {
  width: 400px !important;
  height: 80px !important;
}
</style>
