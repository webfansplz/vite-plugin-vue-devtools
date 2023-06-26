<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

// @ts-expect-error virtual module
import vueDevToolsOptions from 'virtual:vue-devtools-options'
import { usePanelVisible } from './composables'
import { usePosition } from './composables/usePosition'
import { isSafari, useWindowEventListener } from './utils'
import { state } from './composables/state'

// Reuse @vuejs/devtools instance first

const props = defineProps({
  hook: {
    type: Object,
  },
})

const hook = props.hook

const DevToolsHooks = {
  APP_INIT: 'app:init',
  COMPONENT_UPDATED: 'component:updated',
  COMPONENT_ADDED: 'component:added',
  COMPONENT_REMOVED: 'component:removed',
  COMPONENT_EMIT: 'component:emit',
  PERF_START: 'perf:start',
  PERF_END: 'perf:end',
  ADD_ROUTE: 'router:add-route',
  REMOVE_ROUTE: 'router:remove-route',
}

const PANEL_MIN = 15
const PANEL_MAX = 100
const PANEL_PADDING = 10

const clientUrl = `${vueDevToolsOptions.base || '/'}__devtools__/`
const iframe = ref()
const modalRef = ref(null)
const isInPopup = ref(false)

const hookBuffer = []
let isAppCreated = false
let innerIframe = null

/** -----panel start-----**/
const { panelVisible, togglePanelVisible } = usePanelVisible()
const panelState = ref({
  position: 'bottom',
  viewMode: 'default',
  width: 80,
  height: 60,
})
const panelStyle = computed(() => {
  const height = `calc(${panelState.value.height}vh - ${PANEL_PADDING}px)`
  const width = `calc(${panelState.value.width}vw - ${PANEL_PADDING}px)`
  if (panelState.value.viewMode === 'xs') {
    return {
      bottom: `${PANEL_PADDING}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      height: '80px',
      width: '400px',
    }
  }

  if (panelState.value.position === 'bottom') {
    return {
      transform: 'translateX(-50%)',
      bottom: `${PANEL_PADDING}px`,
      left: '50%',
      height,
      width,
    }
  }
  else if (panelState.value.position === 'top') {
    return {
      transform: 'translateX(-50%)',
      top: `${PANEL_PADDING}px`,
      left: '50%',
      height,
      width,
    }
  }
  else if (panelState.value.position === 'left') {
    return {
      transform: 'translateY(-50%)',
      top: '50%',
      left: `${PANEL_PADDING}px`,
      height,
      width,
    }
  }
  else {
    return {
      transform: 'translateY(-50%)',
      top: '50%',
      right: `${PANEL_PADDING}px`,
      height,
      width,
    }
  }
})
const toggleButtonPosition = computed(() => {
  if (panelState.value.position === 'left') {
    return {
      'left': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '0 100px 100px 0',
      '--hover-translate': 'translateX(3px)',
    }
  }
  if (panelState.value.position === 'right') {
    return {
      'right': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '100px 0 0 100px',
      '--hover-translate': 'translateX(-3px)',
    }
  }
  if (panelState.value.position === 'top') {
    return {
      'top': '-3px',
      'left': 'calc(50% - 25px)',
      'borderRadius': '0 0 100px 100px',
      'height': '30px',
      'width': '40px',
      '--hover-translate': 'translate(0, 3px)',
    }
  }
  return {
    'bottom': '-5px',
    'left': 'calc(50% - 25px)',
    'borderRadius': '100px 100px 0 0',
    'height': '30px',
    'width': '40px',
    '--hover-translate': 'translate(0, -3px)',
  }
})
const panelPosition = computed(() =>
  panelVisible.value
    ? panelStyle.value
    : { zIndex: -100000, left: '-9999px', top: '-9999px' },
)

function initPanelPosition() {
  const frameState = localStorage.getItem('__vue-devtools-frame-state__')
  if (frameState) {
    const parsedFrameState = JSON.parse(frameState)
    panelState.value.position = parsedFrameState.position
  }
}

function getIframe() {
  iframe.value = document.createElement('iframe')
  iframe.value.id = 'vue-devtools-iframe'
  iframe.value.src = clientUrl
  iframe.value.setAttribute('data-v-inspector-ignore', 'true')
  iframe.value.onload = async () => {
    await waitForClientInjection()
    setupClient()
  }
  return iframe.value
}

watchEffect(() => {
  if (!modalRef.value || isInPopup.value)
    return

  if (panelVisible.value) {
    const iframe = getIframe()
    iframe.style.pointerEvents = isDragging.value ? 'none' : 'auto'

    if (!innerIframe && Array.from(modalRef.value.children).every(el => el !== iframe))
      modalRef.value.appendChild(iframe)

    innerIframe = iframe
  }
})

// Experimental: Picture-in-Picture mode
// https://developer.chrome.com/docs/web-platform/document-picture-in-picture/
const documentPictureInPicture = window.documentPictureInPicture
async function popup() {
  const iframe = getIframe()
  const pip = await documentPictureInPicture.requestWindow({
    width: Math.round(window.innerWidth * 80 / 100),
    height: Math.round(window.innerHeight * 60 / 100),
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
  pip.__VUE_DEVTOOLS_GLOBAL_HOOK__ = props.hook
  pip.__VUE_DEVTOOLS_IS_POPUP__ = true
  pip.document.title = 'Vue DevTools'
  pip.document.head.appendChild(style)
  pip.document.body.appendChild(iframe)
  pip.addEventListener('resize', () => {
  })
  pip.addEventListener('pagehide', () => {
    pip.close()
    isInPopup.value = false
  })
}

/** -----resize start-----**/
const resizeBaseClassName = 'vue-devtools-resize-handle'
const resizeVerticalClassName = [resizeBaseClassName, `${resizeBaseClassName}-vertical`]
const resizeHorizontalClassName = [resizeBaseClassName, `${resizeBaseClassName}-horizontal`]
const resizeCornerClassName = [resizeBaseClassName, `${resizeBaseClassName}-corner`]
function toggleDragging(direction) {
  isDragging.value = direction
}
document.addEventListener('mouseup', () => {
  isDragging.value = false
})
document.addEventListener('mouseleave', () => {
  isDragging.value = false
})
document.addEventListener('mousemove', (e) => {
  if (!isDragging.value)
    return

  const alignSide = panelState.value.position === 'left' || panelState.value.position === 'right'

  if (isDragging.value === 'horizontal' || isDragging.value === 'both') {
    const y = panelState.value.position === 'top'
      ? window.innerHeight - e.clientY
      : e.clientY
    const boxHeight = window.innerHeight
    const value = alignSide
      ? (Math.abs(y - (window.innerHeight / 2))) / boxHeight * 100 * 2
      : (window.innerHeight - y) / boxHeight * 100
    panelState.value.height = Math.min(PANEL_MAX, Math.max(PANEL_MIN, value))
  }

  if (isDragging.value === 'vertical' || isDragging.value === 'both') {
    const x = panelState.value.position === 'left'
      ? window.innerWidth - e.clientX
      : e.clientX
    const boxWidth = window.innerWidth
    const value = alignSide
      ? (window.innerWidth - x) / boxWidth * 100
      : (Math.abs(x - (window.innerWidth / 2))) / boxWidth * 100 * 2
    panelState.value.width = Math.min(PANEL_MAX, Math.max(PANEL_MIN, value))
  }
})
/** -----resize end-----**/

/** -----panel end-----**/

/** -----inspector end-----**/

function toggleViewMode(state) {
  if (state) {
    panelState.value.viewMode = state
    return
  }
  if (panelState.value.viewMode === 'xs')
    panelState.value.viewMode = 'default'

  else
    panelState.value.viewMode = 'xs'
}

function enableComponentInspector() {
  window.__VUE_INSPECTOR__?.enable()
  panelState.value.viewMode = 'xs'
}

function disableComponentInspector() {
  window.__VUE_INSPECTOR__?.disable()
  hook.emit('host:inspector:close')
  if (panelState.value.viewMode === 'xs')
    panelState.value.viewMode = 'default'
}
/** -----inspector end-----**/

/** -----client start-----**/
function waitForClientInjection(retry = 50, timeout = 200) {
  const test = () => !!iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__ && isAppCreated

  if (test())
    return

  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (test()) {
        clearInterval(interval)
        resolve()
      }
      else if (retry-- <= 0) {
        clearInterval(interval)
        reject(Error('Vue Devtools client injection failed'))
      }
    }, timeout)
  })
}

function setupClient() {
  const injection = iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__
  const componentInspector = window.__VUE_INSPECTOR__
  if (componentInspector) {
    const _openInEditor = componentInspector.openInEditor
    componentInspector.openInEditor = async (...params) => {
      disableComponentInspector()
      _openInEditor(...params)
    }
  }
  injection.setClient({
    hook,
    hookBuffer,
    inspector: {
      enable: enableComponentInspector,
      disable: disableComponentInspector,
    },
    panel: {
      toggleViewMode,
      toggle: togglePanelVisible,
      togglePosition(position) {
        if (position === 'popup') {
          isInPopup.value = true
          popup()
          return
        }
        panelState.value.position = position
      },
    },
  })
}
/** -----client end-----**/

function updateHookBuffer(type, args) {
  hookBuffer.push([type, args])
}

function collectDynamicRoute(app) {
  const router = app?.config?.globalProperties?.$router
  if (!router)
    return

  const _addRoute = router.addRoute
  router.addRoute = (...args) => {
    const res = _addRoute(...args)

    if (!iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
      updateHookBuffer(DevToolsHooks.ADD_ROUTE, {
        args: [...args],
      })
    }

    return res
  }

  const _removeRoute = router.removeRoute
  router.removeRoute = (...args) => {
    const res = _removeRoute(...args)

    if (!iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
      updateHookBuffer(DevToolsHooks.REMOVE_ROUTE, {
        args: [...args],
      })
    }

    return res
  }
}

function collectHookBuffer() {
  // const sortId = 0

  function stopCollect(component) {
    return component?.root?.type?.devtools?.hide || iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded
  }

  hook.on(DevToolsHooks.APP_INIT, (app) => {
    if (!app || app._instance.type?.devtools?.hide)
      return

    collectDynamicRoute(app)
    updateHookBuffer(DevToolsHooks.APP_INIT, {
      app,
    })
    setTimeout(() => {
      isAppCreated = true
    }, 80)
  });

  // close perf to avoid performance issue (#9)
  // hook.on(DevToolsHooks.PERF_START, (app, uid, component, type, time) => {
  //   if (stopCollect(component))
  //     return

  //   updateHookBuffer(DevToolsHooks.COMPONENT_EMIT, {
  //     now: Date.now(),
  //     app,
  //     uid,
  //     component,
  //     type,
  //     time,
  //     sortId: sortId++,
  //   })
  // })
  // hook.on(DevToolsHooks.PERF_END, (app, uid, component, type, time) => {
  //   if (stopCollect(component))
  //     return

  //   updateHookBuffer(DevToolsHooks.PERF_END, {
  //     now: Date.now(),
  //     app,
  //     uid,
  //     component,
  //     type,
  //     time,
  //     sortId: sortId++,
  //   })
  // })

  [
    DevToolsHooks.COMPONENT_UPDATED,
    DevToolsHooks.COMPONENT_ADDED,
    DevToolsHooks.COMPONENT_REMOVED,
    DevToolsHooks.COMPONENT_EMIT,
  ].forEach((item) => {
    hook.on(item, (app, uid, parentUid, component) => {
      if (!app || (typeof uid !== 'number' && !uid) || !component || stopCollect(component))
        return

      updateHookBuffer(item, {
        app, uid, parentUid, component,
      })
    })
  })
}

// init
collectHookBuffer()
initPanelPosition()

const toggleButtonRef = ref(null)

useWindowEventListener('click', (event) => {
  if (isInPopup.value)
    return
  const modalEl = modalRef.value
  const toggleButtonEl = toggleButtonRef.value
  if (!modalEl || !toggleButtonEl || event.composedPath().includes(modalEl) || event.composedPath().includes(toggleButtonEl))
    return
  const frameState = localStorage.getItem('__vue-devtools-frame-state__')
  if (frameState) {
    const parsedFrameState = JSON.parse(frameState)
    if (parsedFrameState.closeOnOutsideClick)
      panelVisible.value = false
  }
})

const panelEl = ref<HTMLDivElement>()

const { onPointerDown, anchorStyle, iframeStyle, isDragging, isVertical } = usePosition(panelEl)

const vars = computed(() => {
  const dark = true
  return {
    '--vue-devtools-widget-bg': dark ? '#111' : '#ffffff',
    '--vue-devtools-widget-fg': dark ? '#F5F5F5' : '#111',
    '--vue-devtools-widget-border': dark ? '#3336' : '#efefef',
    '--vue-devtools-widget-shadow': dark ? 'rgba(0,0,0,0.3)' : 'rgba(128,128,128,0.1)',
  }
})
</script>

<template>
  <div
    id="vue-devtools-anchor"
    :style="[anchorStyle, vars]"
    :class="{ 'vue-devtools-vertical': isVertical }"
  >
    <div v-show="!isInPopup" ref="modalRef" class="vue-devtools-panel" :style="panelPosition">
      <!-- resize -->
      <template v-if="panelState.viewMode === 'default'">
        <template v-if="panelState.position !== 'top'">
          <div :class="resizeHorizontalClassName" :style="{ top: 0 }" @mousedown.prevent="toggleDragging('horizontal')" />
          <div
            v-if="panelState.position !== 'left'" :class="resizeCornerClassName"
            :style="{ top: 0, left: 0, cursor: 'nwse-resize' }" @mousedown.prevent="toggleDragging('both')"
          />
          <div
            v-if="panelState.position !== 'right'" :class="resizeCornerClassName"
            :style="{ top: 0, right: 0, cursor: 'nesw-resize' }" @mousedown.prevent="toggleDragging('both')"
          />
        </template>

        <template v-if="panelState.position !== 'bottom'">
          <div
            :class="resizeHorizontalClassName" :style="{ bottom: 0 }"
            @mousedown.prevent="toggleDragging('horizontal')"
          />
          <div
            v-if="panelState.position !== 'right'" :class="resizeCornerClassName"
            :style="{ bottom: 0, right: 0, cursor: 'nwse-resize' }" @mousedown.prevent="toggleDragging('both')"
          />
          <div
            v-if="panelState.position !== 'left'" :class="resizeCornerClassName"
            :style="{ bottom: 0, left: 0, cursor: 'nesw-resize' }" @mousedown.prevent="toggleDragging('both')"
          />
        </template>

        <div
          v-if="panelState.position !== 'left'" :class="resizeVerticalClassName" :style="{ left: 0 }"
          @mousedown.prevent="toggleDragging('vertical')"
        />
        <div
          v-if="panelState.position !== 'right'" :class="resizeVerticalClassName" :style="{ right: 0 }"
          @mousedown.prevent="toggleDragging('vertical')"
        />
      </template>
    </div>
    <!-- toggle button -->
    <div v-if="!isSafari()" class="vue-devtools-glowing" :style="isDragging ? 'opacity: 0.6 !important' : ''" />
    <div ref="panelEl" class="vue-devtools-button-panel" @pointerdown="onPointerDown">
      <button
        class="vue-devtools-icon-button vue-devtools-vue-button"
        title="Toggle Vue DevTools" aria-label="Toggle devtools panel"
        :style="state.open ? '' : 'filter:saturate(0)'"
        @click="togglePanelVisible"
      >
        <svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
          <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
          <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
        </svg>
      </button>
      <div style="border-left: 1px solid #8883;width:1px;height:10px;" />
      <button class="vue-devtools-icon-button" title="Toggle Component Inspector" @click="client.inspector.toggle">
        <!-- :style="client.inspector.isEnabled.value ? 'opacity:1;color:#00dc82' : ''" -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="height: 1.2em; width: 1.2em; opacity:0.5;opacity:1;color:#00dc82"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r=".5" fill="currentColor" /><path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" /></g>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
#vue-devtools-anchor {
  position: fixed;
  z-index: 2147483645;
}

#vue-devtools-anchor button {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  color: inherit;
}

#vue-devtools-anchor .vue-devtools-glowing {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  opacity: 0;
  transition: all 0.8s ease;
  pointer-events: none;
  z-index: -1;
  border-radius: 9999px;
  background-image: linear-gradient(45deg,#00dc82,#36e4da,#0047e1);
  filter: blur(60px);
}

#vue-devtools-anchor .vue-devtools-icon-button {
  border-radius: 100%;
  border-width: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}
#vue-devtools-anchor .vue-devtools-icon-button:hover {
  opacity: 1;
}

#vue-devtools-anchor .vue-devtools-icon-button svg {
  width: 16px;
  height: 16px;
}

#vue-devtools-anchor:hover .vue-devtools-glowing {
  opacity: 0.6;
}

#vue-devtools-anchor .vue-devtools-button-panel {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  height: 30px;
  padding: 4px 4px 4px 5px;
  border: 1px solid var(--vue-devtools-widget-border);
  border-radius: 20px;
  background-color: var(--vue-devtools-widget-bg);
  backdrop-filter: blur(10px);
  color: var(--vue-devtools-widget-fg);
  box-shadow: 2px 2px 8px var(--vue-devtools-widget-shadow);
  transition: background 0.2s ease;
  user-select: none;
}

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-vue-button {
  transform: rotate(-90deg);
}

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-label {
  transform: rotate(-90deg);
  flex-direction: column;
  gap: 2px;
  padding: 0 10px;
}

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-button-panel {
  transform: translate(-50%, -50%) rotate(90deg);
  box-shadow: 2px -2px 8px var(--nuxt-devtools-widget-shadow);
}

.vue-devtools-panel :deep(iframe) {
  width: 100%;
  height: 100%;
  outline: 0;
  border: 1px solid rgba(125, 125, 125, 0.2);
  border-radius: 8px;
}

.vue-devtools-resize-handle:hover {
  background: rgba(125, 125, 125, 0.1);
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

.vue-devtools-resize-handle-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  margin: -6px;
  border-radius: 6px;
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
</style>
