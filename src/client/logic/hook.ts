import { initPinia } from './pinia'
import { initVueApp, instance, app as vueApp } from './instance'
import { useClient } from './client'

const enum DevtoolsHooks {
  COMPONENT_INIT = 'app:init',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
}

function hideInDevtools(component) {
  return component?.root?.type?.devtools?.hide
}

export function connect() {
  const client = useClient()
  const hook = client.value!.hook!
  hook.on(DevtoolsHooks.COMPONENT_INIT, (app) => {
    // console.log('init', app)
    if (app?._vueDevtools_hidden_)
      return
    vueApp.value = app
    instance.value = app._instance
  })

  hook.on(DevtoolsHooks.COMPONENT_UPDATED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
      return

    initVueApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    initPinia(component)

    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
      return

    // console.log('added')
    initVueApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_REMOVED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
      return

    // console.log('removed')

    initVueApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_EMIT, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
      return

    // console.log('component:emit')

    initVueApp(app, component)
  })
}

export function initHook(buffer: [string, Record<string, any>][]) {
  buffer.forEach(([eventType, { app, component }]) => {
    if (eventType === DevtoolsHooks.COMPONENT_ADDED)
      initPinia(component)

    initVueApp(app, component)
  })
}
