<script setup lang="ts">
import { computed, ref } from 'vue'

// @ts-expect-error virtual module
import vueDevToolsOptions from 'virtual:vue-devtools-options'
import Frame from './FrameBox.vue'
import ComponentInspector from './ComponentInspector.vue'
import { useHighlightComponent, useIframe, useInspector, usePanelVisible, usePiPMode, usePosition } from './composables'
import { checkIsSafari, useColorScheme, usePreferredColorScheme, warn } from './utils'

const props = defineProps({
  hook: {
    type: Object,
    required: true,
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

const hookBuffer: [string, { args: any[] }][] = []

let isAppCreated = false
const panelState = ref<{
  viewMode: 'default' | 'xs'
}>({
  viewMode: 'default',
})

const { togglePanelVisible, closePanel, panelVisible } = usePanelVisible()
const panelEl = ref<HTMLDivElement>()
const { onPointerDown, anchorStyle, iframeStyle, isDragging, isVertical } = usePosition(panelEl)
const vars = computed(() => {
  const colorScheme = useColorScheme()
  const dark = colorScheme.value === 'auto'
    ? usePreferredColorScheme().value === 'dark'
    : colorScheme.value === 'dark'
  return {
    '--vue-devtools-widget-bg': dark ? '#111' : '#ffffff',
    '--vue-devtools-widget-fg': dark ? '#F5F5F5' : '#111',
    '--vue-devtools-widget-border': dark ? '#3336' : '#efefef',
    '--vue-devtools-widget-shadow': dark ? 'rgba(0,0,0,0.3)' : 'rgba(128,128,128,0.1)',
  }
})

function waitForClientInjection(iframe: HTMLIFrameElement, retry = 50, timeout = 200): Promise<void> | void {
  const test = () => !!iframe?.contentWindow?.__VUE_DEVTOOLS_VIEW__ && isAppCreated

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
        reject(Error('Vue DevTools client injection failed'))
      }
    }, timeout)
  })
}

const {
  toggleInspector, inspectorLoaded,
  inspectorEnabled, disableInspector,
  openInEditor, waitForInspectorInit,
} = useInspector()

const clientUrl = `${vueDevToolsOptions.base || '/'}__devtools__/`
const { iframe, getIframe } = useIframe(clientUrl, async () => {
  const iframe = getIframe()
  await waitForClientInjection(iframe)
  setupClient(iframe)
})

// Picture-in-Picture mode
const { popup } = usePiPMode(getIframe, hook)
const { overlayVisible, name: componentName, bounds, highlight, unHighlight } = useHighlightComponent()

async function setupClient(iframe: HTMLIFrameElement) {
  const injection: any = iframe?.contentWindow?.__VUE_DEVTOOLS_VIEW__
  if (!inspectorLoaded.value)
    waitForInspectorInit()

  injection.setClient({
    hook,
    hookBuffer,
    // inspector: {
    //   enable: enableInspector,
    //   disable: disableInspector,
    // },
    panel: {
      toggleViewMode: () => {
        if (panelState.value.viewMode === 'xs')
          panelState.value.viewMode = 'default'
        else
          panelState.value.viewMode = 'xs'
      },
      toggle: togglePanelVisible,
      popup,
    },
    openInEditor: openInEditor.value ?? (() => {
      warn('Unable to load inspector, open-in-editor is not available.')
    }),
    componentInspector: {
      highlight,
      unHighlight,
      scrollToComponent(bounds) {
        const scrollTarget = document.createElement('div')
        scrollTarget.style.position = 'absolute'
        scrollTarget.style.width = `${Math.round(bounds.width * 100) / 100}px`
        scrollTarget.style.height = `${Math.round(bounds.height * 100) / 100}px`
        scrollTarget.style.top = `${Math.round(bounds.top * 100) / 100}px`
        scrollTarget.style.left = `${Math.round(bounds.left * 100) / 100}px`
        document.body.appendChild(scrollTarget)
        scrollTarget.scrollIntoView({
          behavior: 'smooth',
        })
        setTimeout(() => {
          document.body.removeChild(scrollTarget)
        }, 2000)
      },
    },
  })
}

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
</script>

<template>
  <div
    id="vue-devtools-anchor"
    :style="[anchorStyle, vars]"
    :class="{ 'vue-devtools-vertical': isVertical }"
  >
    <!-- toggle button -->
    <div v-if="!checkIsSafari()" class="vue-devtools-glowing" :style="isDragging ? 'opacity: 0.6 !important' : ''" />
    <div ref="panelEl" class="vue-devtools-button-panel" @pointerdown="onPointerDown">
      <div
        class="vue-devtools-icon-button vue-devtools-vue-button"
        title="Toggle Vue DevTools" aria-label="Toggle devtools panel"
        :style="panelVisible ? '' : 'filter:saturate(0)'"
        @click="togglePanelVisible"
      >
        <svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
          <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
          <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
        </svg>
      </div>
      <div style="border-left: 1px solid #8883;width:1px;height:10px;" />
      <div
        class="vue-devtools-icon-button vue-devtools-inspector-button"
        :class="{ disabled: !inspectorLoaded }"
        :disabled="!inspectorLoaded"
        title="Toggle Component Inspector" @click="toggleInspector"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="height: 1.1em; width: 1.1em; opacity:0.5;"
          :style="inspectorEnabled ? 'opacity:1;color:#00dc82' : ''"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r=".5" fill="currentColor" /><path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" /></g>
        </svg>
      </div>
    </div>
    <!-- iframe -->
    <Frame
      :style="iframeStyle" :is-dragging="isDragging"
      :client="{
        close: closePanel,
        inspector: {
          disable: disableInspector,
          isEnabled: ref(inspectorEnabled),
        },
        getIFrame: getIframe,
      }"
      :view-mode="panelState.viewMode"
    />
  </div>
  <!-- component inspector -->
  <ComponentInspector v-if="overlayVisible" :bounds="bounds" :name="componentName" />
</template>

<style scoped>
#vue-devtools-anchor {
  position: fixed;
  z-index: 2147483645;
  transform-origin: center center;
  transform: translate(-50%, -50%) rotate(0);
}

#vue-devtools-anchor .vue-devtools-icon-button {
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
  width: 14px;
  height: 14px;
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
  box-sizing: border-box;
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

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-button-panel {
  transform: translate(-50%, -50%) rotate(90deg);
  box-shadow: 2px -2px 8px var(--nuxt-devtools-widget-shadow);
}

#vue-devtools-anchor .vue-devtools-inspector-button.disabled {
  opacity: 0.2;
  cursor: not-allowed;
  animation: blink 1.5s linear infinite;
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.2;
  }
}
</style>
