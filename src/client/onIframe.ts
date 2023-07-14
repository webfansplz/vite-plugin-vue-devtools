import {
  getViewMode,
  togglePanelVisible,
  togglePopup,
  toggleViewMode,
} from 'vite-plugin-devtools/client'
import { createApp, h, watchEffect } from 'vue'
import ComponentInspector from '../node/views/ComponentInspector.vue'
import { useHighlightComponent, useInspector } from './composables/iframe'
import styles from './styles/component-inspector.css?inline'

const stylesEl = document.createElement('style')
stylesEl.append(styles)
document.body.append(stylesEl)

const NAME = 'vite-plugin-vue-devtools'
const CONTAINER_ID = '__devtools-container__'

const inspectorEl = document.querySelector(
  `.devtools-inspector-button.${NAME}`,
) as HTMLDivElement
const containerEl = document.getElementById(CONTAINER_ID) as HTMLDivElement
const componentInspectorEl = document.createElement('div')
containerEl.append(componentInspectorEl)

const {
  toggleInspector,
  inspectorLoaded,
  inspectorEnabled,
  // disableInspector,
  openInEditor,
  waitForInspectorInit,
} = useInspector()
const { overlayVisible, name: componentName, bounds, highlight, unHighlight } = useHighlightComponent()

watchEffect((onCleanup) => {
  inspectorEl.style.opacity = inspectorEnabled.value ? '1' : ''
  inspectorEl.style.color = inspectorEnabled.value ? '#00dc82' : ''

  if (inspectorLoaded.value)
    inspectorEl.classList.remove('disabled')

  else
    inspectorEl.classList.add('disabled')

  inspectorEl.addEventListener('click', toggleInspector)
  onCleanup(() => inspectorEl.removeEventListener('click', toggleInspector))
})

export default (iframe: HTMLIFrameElement) => {
  createApp({
    render: () => h(() => overlayVisible.value ? h(ComponentInspector, { bounds: bounds.value, name: componentName.value }) : null),
    devtools: {
      hide: true,
    },
  }).mount(componentInspectorEl)
  let isAppCreated = false

  const hook = (window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ??= {
    events: new Map(),
    on(event, fn) {
      if (!this.events.has(event))
        this.events.set(event, [])

      this.events.get(event).push(fn)
    },
    emit(event, ...payload) {
      if (this.events.has(event))
        this.events.get(event).forEach(fn => fn(...payload))
    },
  })

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

  function waitForClientInjection(
    retry = 50,
    timeout = 200,
  ): Promise<void> | void {
    const test = () =>
      !!iframe?.contentWindow?.__VUE_DEVTOOLS_VIEW__ && isAppCreated

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
  async function popup() {
    const { pip, append } = await togglePopup(NAME)
    pip.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook
    pip.__VUE_DEVTOOLS_IS_POPUP__ = true
    append()
  }

  function setupClient() {
    if (!inspectorLoaded.value)
      waitForInspectorInit()
    const injection: any = iframe?.contentWindow?.__VUE_DEVTOOLS_VIEW__
    injection.setClient({
      hook,
      hookBuffer,
      // inspector: {
      //   enable: enableInspector,
      //   disable: disableInspector,
      // },
      panel: {
        toggleViewMode: () => {
          if (getViewMode() === 'xs')
            toggleViewMode('default')
          else toggleViewMode('xs')
        },
        toggle: togglePanelVisible,
        popup,
      },
      openInEditor:
        openInEditor.value
        ?? (() => {
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

      if (!iframe.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
        updateHookBuffer(DevToolsHooks.ADD_ROUTE, {
          args: [...args],
        })
      }

      return res
    }

    const _removeRoute = router.removeRoute
    router.removeRoute = (...args) => {
      const res = _removeRoute(...args)

      if (!iframe?.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded) {
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
      return (
        component?.root?.type?.devtools?.hide
        || iframe.contentWindow?.__VUE_DEVTOOLS_VIEW__?.loaded
      )
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
        if (
          !app
          || (typeof uid !== 'number' && !uid)
          || !component
          || stopCollect(component)
        )
          return

        updateHookBuffer(item, {
          app,
          uid,
          parentUid,
          component,
        })
      })
    })
  }

  // init
  collectHookBuffer()

  iframe.onload = async () => {
    await waitForClientInjection()
    setupClient()
  }
}
