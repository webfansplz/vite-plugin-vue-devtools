<script setup>
import { computed, onMounted, ref } from 'vue'
import vueDevToolsOptions from 'virtual:vue-devtools-options'

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

const clientUrl = `${vueDevToolsOptions.base || '/'}__devtools/`
const iframe = ref()

const hookBuffer = []
let isAppCreated = false

/** -----panel start-----**/
const panelVisible = ref(false)
const panelState = ref({
  position: 'bottom',
  viewMode: 'default',
  width: 80,
  height: 60,
})
const panelStyle = computed(() => {
  const height = `calc(${panelState.value.height}vh - ${PANEL_PADDING}px)`
  const width = `calc(${panelState.value.width}vw - ${PANEL_PADDING}px)`
  if (panelState.value.viewMode === 'component-inspector') {
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

function togglePanel() {
  panelVisible.value = !panelVisible.value
}

function initPanelPosition() {
  const frameState = localStorage.getItem('__vue-devtools-frame-state__')
  if (frameState) {
    const parsedFrameState = JSON.parse(frameState)
    panelState.value.position = parsedFrameState.position
  }
}

/** -----resize start-----**/
const isDragging = ref(false)
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

function enableComponentInspector() {
  window.__VUE_INSPECTOR__?.enable()
  panelState.value.viewMode = 'component-inspector'
}

function disableComponentInspector() {
  window.__VUE_INSPECTOR__?.disable()
  hook.emit('host:inspector:close')
  if (panelState.value.viewMode === 'component-inspector')
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
      toggle: togglePanel,
      togglePosition(position) {
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

async function onLoad() {
  await waitForClientInjection()
  setupClient()
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD' && e.altKey && e.shiftKey)
      togglePanel()
  })
})
</script>

<template>
  <div class="vue-devtools-panel" :style="panelPosition">
    <!-- client -->
    <iframe ref="iframe" :src="clientUrl" :style="{
      'pointer-events': isDragging ? 'none' : 'auto',
    }" @load="onLoad" />
    <!-- resize -->
    <template v-if="panelState.viewMode === 'default'">
      <template v-if="panelState.position !== 'top'">
        <div :class="resizeHorizontalClassName" :style="{ top: 0 }" @mousedown.prevent="toggleDragging('horizontal')" />
        <div v-if="panelState.position !== 'left'" :class="resizeCornerClassName"
          :style="{ top: 0, left: 0, cursor: 'nwse-resize' }" @mousedown.prevent="toggleDragging('both')" />
        <div v-if="panelState.position !== 'right'" :class="resizeCornerClassName"
          :style="{ top: 0, right: 0, cursor: 'nesw-resize' }" @mousedown.prevent="toggleDragging('both')" />
      </template>

      <template v-if="panelState.position !== 'bottom'">
        <div :class="resizeHorizontalClassName" :style="{ bottom: 0 }"
          @mousedown.prevent="toggleDragging('horizontal')" />
        <div v-if="panelState.position !== 'right'" :class="resizeCornerClassName"
          :style="{ bottom: 0, right: 0, cursor: 'nwse-resize' }" @mousedown.prevent="toggleDragging('both')" />
        <div v-if="panelState.position !== 'left'" :class="resizeCornerClassName"
          :style="{ bottom: 0, left: 0, cursor: 'nesw-resize' }" @mousedown.prevent="toggleDragging('both')" />
      </template>

      <div v-if="panelState.position !== 'left'" :class="resizeVerticalClassName" :style="{ left: 0 }"
        @mousedown.prevent="toggleDragging('vertical')" />
      <div v-if="panelState.position !== 'right'" :class="resizeVerticalClassName" :style="{ right: 0 }"
        @mousedown.prevent="toggleDragging('vertical')" />
    </template>
  </div>
  <!-- toggle button -->
  <button class="vue-devtools-toggle" aria-label="Toggle devtools panel" :style="toggleButtonPosition"
    @click.prevent="togglePanel">
    <svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
      <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
      <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
    </svg>
  </button>
</template>

<style scoped>
.vue-devtools-panel {
  position: fixed;
  z-index: 2147483645;
  width: calc(80vw - 20px);
  height: calc(60vh - 20px);
}

.vue-devtools-panel iframe {
  width: 100%;
  height: 100%;
  outline: 0;
  border: 1px solid rgba(125, 125, 125, 0.2);
  border-radius: 8px;
}

.vue-devtools-toggle {
  position: fixed;
  background: #0C0C0C;
  border: 1px solid rgba(125, 125, 125, 0.2);
  box-shadow: 3px 5px 10px rgba(0, 0, 0, 0.1);
  z-index: 2147483645;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  outline: 0;
}

.vue-devtools-toggle:hover {
  transform: var(--hover-translate);
  opacity: 1;
}

.vue-devtools-toggle svg {
  width: 16px;
  height: 16px;
  margin: auto;
  margin-top: 3px;
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
