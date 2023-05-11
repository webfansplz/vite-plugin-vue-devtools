<script setup>
import { computed, onMounted, ref } from 'vue'
import vueDevtoolsOptions from 'virtual:vue-devtools-options'

const props = defineProps({
  hook: {
    type: Object,
  },
})

const DevtoolsHooks = {
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

window.__VUE_DEVTOOLS_GLOBAL_HOOKS__ = function () {
  return props.hook
}

const isDragging = ref(false)

document.addEventListener('mouseup', () => {
  isDragging.value = false
})

document.addEventListener('mouseleave', () => {
  isDragging.value = false
})

const PANEL_MIN = 15
const PANEL_MAX = 100
const PANEL_PADDING = 10

const clientUrl = `${vueDevtoolsOptions.base || '/'}__devtools/`
const iframe = ref()
const panelState = ref({
  position: 'bottom',
  viewMode: 'default',
})
const panelVisible = ref(false)
const hookBuffer = []
let isAppCreated = false

const panelHight = ref(60)
const panelWidth = ref(80)

const panelStyle = computed(() => {
  const height = `calc(${panelHight.value}vh - ${PANEL_PADDING}px)`
  const width = `calc(${panelWidth.value}vw - ${PANEL_PADDING}px)`
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
  else if (panelState.value.position === 'right') {
    return {
      'right': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '100px 0 0 100px',
      '--hover-translate': 'translateX(-3px)',
    }
  }
  else if (panelState.value.position === 'top') {
    return {
      'top': '-3px',
      'left': 'calc(50% - 25px)',
      'borderRadius': '0 0 100px 100px',
      'height': '30px',
      'width': '40px',
      '--hover-translate': 'translate(0, 3px)',
    }
  }
  else {
    return {
      'bottom': '-5px',
      'left': 'calc(50% - 25px)',
      'borderRadius': '100px 100px 0 0',
      'height': '30px',
      'width': '40px',
      '--hover-translate': 'translate(0, -3px)',
    }
  }
})
const panelPosition = computed(() =>
  panelVisible.value
    ? panelStyle.value
    : { zIndex: -100000, left: '-9999px', top: '-9999px' },
)

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
    panelHight.value = Math.min(PANEL_MAX, Math.max(PANEL_MIN, value))
  }

  if (isDragging.value === 'vertical' || isDragging.value === 'both') {
    const x = panelState.value.position === 'left'
      ? window.innerWidth - e.clientX
      : e.clientX
    const boxWidth = window.innerWidth
    const value = alignSide
      ? (window.innerWidth - x) / boxWidth * 100
      : (Math.abs(x - (window.innerWidth / 2))) / boxWidth * 100 * 2
    panelWidth.value = Math.min(PANEL_MAX, Math.max(PANEL_MIN, value))
  }
})

function togglePanel() {
  panelVisible.value = !panelVisible.value
}

function enableComponentInspector() {
  window.__VUE_INSPECTOR__?.enable()
  panelState.value.viewMode = 'component-inspector'
}

function disableComponentInspector() {
  window.__VUE_INSPECTOR__?.disable()
  props.hook.emit('host:inspector:close')
  if (panelState.value.viewMode === 'component-inspector')
    panelState.value.viewMode = 'default'
}

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
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Vue Devtools client injection failed')
      }
    }, timeout)
  })
}

async function onLoad() {
  await waitForClientInjection()
  setupClient()
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
    hook: props.hook,
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

function initPanelPosition() {
  const frameState = localStorage.getItem('__vue-devtools-frame-state__')
  if (frameState) {
    const parsedFrameState = JSON.parse(frameState)
    panelState.value.position = parsedFrameState.position
  }
}

function captureDynamicRoute(app) {
  const router = app?.config?.globalProperties?.$router
  if (!router)
    return

  const _addRoute = router.addRoute
  router.addRoute = (...args) => {
    const res = _addRoute(...args)

    if (!iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
      hookBuffer.push([DevtoolsHooks.ADD_ROUTE, {
        args: [...args],
      }])
    }

    return res
  }

  const _removeRoute = router.removeRoute
  router.removeRoute = (...args) => {
    const res = _removeRoute(...args)

    if (!iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
      hookBuffer.push([DevtoolsHooks.REMOVE_ROUTE, {
        args: [...args],
      }])
    }

    return res
  }
}

function collectHookBuffer() {
  let sortId = 0

  function stopCollect(component) {
    return component?.root?.type?.devtools?.hide || iframe.value?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded
  }

  props.hook.on(DevtoolsHooks.APP_INIT, (app) => {
    if (!app || app._instance.type?.devtools?.hide)
      return

    captureDynamicRoute(app)
    hookBuffer.push([DevtoolsHooks.APP_INIT, {
      app,
    }])
    setTimeout(() => {
      isAppCreated = true
    }, 80)
  })

  props.hook.on(DevtoolsHooks.PERF_START, (app, uid, component, type, time) => {
    if (stopCollect(component))
      return

    hookBuffer.push([DevtoolsHooks.PERF_START, {
      now: Date.now(),
      app,
      uid,
      component,
      type,
      time,
      sortId: sortId++,
    }])
  })
  props.hook.on(DevtoolsHooks.PERF_END, (app, uid, component, type, time) => {
    if (stopCollect(component))
      return

    hookBuffer.push([DevtoolsHooks.PERF_END, {
      now: Date.now(),
      app,
      uid,
      component,
      type,
      time,
      sortId: sortId++,
    }])
  });

  [
    DevtoolsHooks.COMPONENT_UPDATED,
    DevtoolsHooks.COMPONENT_ADDED,
    DevtoolsHooks.COMPONENT_REMOVED,
    DevtoolsHooks.COMPONENT_EMIT,
  ].forEach((item) => {
    props.hook.on(item, (app, uid, parentUid, component) => {
      if (!app || (typeof uid !== 'number' && !uid) || !component || stopCollect(component))
        return
      hookBuffer.push([item, {
        app, uid, parentUid, component,
      }])
    })
  })
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD' && e.altKey && e.shiftKey)
      togglePanel()
  })
})

collectHookBuffer()
initPanelPosition()
</script>

<template>
  <div class="vue-devtools-panel" :style="panelPosition">
    <iframe ref="iframe" :src="clientUrl" :style="{
      'pointer-events': isDragging ? 'none' : 'auto',
    }" @load="onLoad" />
    <template v-if="panelState.viewMode === 'default'">
      <div v-if="panelState.position !== 'top'" class="vue-devtools-resize-handle vue-devtools-resize-handle-horizontal"
        :style="{ top: 0 }" @mousedown.prevent="() => isDragging = 'horizontal'" />
      <div v-if="panelState.position !== 'bottom'"
        class="vue-devtools-resize-handle vue-devtools-resize-handle-horizontal" :style="{ bottom: 0 }"
        @mousedown.prevent="() => isDragging = 'horizontal'" />
      <div v-if="panelState.position !== 'left'" class="vue-devtools-resize-handle vue-devtools-resize-handle-vertical"
        :style="{ left: 0 }" @mousedown.prevent="() => isDragging = 'vertical'" />
      <div v-if="panelState.position !== 'right'" class="vue-devtools-resize-handle vue-devtools-resize-handle-vertical"
        :style="{ right: 0 }" @mousedown.prevent="() => isDragging = 'vertical'" />
      <div v-if="panelState.position !== 'top' && panelState.position !== 'left'"
        class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
        :style="{ top: 0, left: 0, cursor: 'nwse-resize' }" @mousedown.prevent="() => isDragging = 'both'" />
      <div v-if="panelState.position !== 'top' && panelState.position !== 'right'"
        class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
        :style="{ top: 0, right: 0, cursor: 'nesw-resize' }" @mousedown.prevent="() => isDragging = 'both'" />
      <div v-if="panelState.position !== 'bottom' && panelState.position !== 'right'"
        class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
        :style="{ bottom: 0, right: 0, cursor: 'nwse-resize' }" @mousedown.prevent="() => isDragging = 'both'" />
      <div v-if="panelState.position !== 'bottom' && panelState.position !== 'left'"
        class="vue-devtools-resize-handle vue-devtools-resize-handle-corner"
        :style="{ bottom: 0, left: 0, cursor: 'nesw-resize' }" @mousedown.prevent="() => isDragging = 'both'" />
    </template>
  </div>
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
  z-index: 2147483647;
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
  z-index: 2147483647;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  align-items: center;
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
