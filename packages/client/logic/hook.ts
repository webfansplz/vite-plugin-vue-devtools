import { DevToolsHooks } from '@vite-plugin-vue-devtools/core'
import { updatePinia } from './pinia'
import { instance, updateApp, app as vueApp } from './app'
import { useDevToolsClient } from './client'

function hideInDevtools(component) {
  return component?.root?.type?.devtools?.hide
}

const client = useDevToolsClient()

function subscribeHook() {
  const client = useDevToolsClient()
  const hook = client.value.hook
  hook.on(DevToolsHooks.APP_INIT, (app) => {
    if (!app || app._instance.type?.devtools?.hide)
      return

    vueApp.value = app
    instance.value = app._instance
  })

  function skipCollect(app, uid, component) {
    return (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
  }

  hook.on(DevToolsHooks.COMPONENT_UPDATED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    updateApp(app, component)
  })

  hook.on(DevToolsHooks.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('added')
    updateApp(app, component)
  })

  hook.on(DevToolsHooks.COMPONENT_REMOVED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('removed')

    updateApp(app, component)
  })

  hook.on(DevToolsHooks.COMPONENT_EMIT, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('component:emit')

    updateApp(app, component)
  })
}

function publishHook(buffer: [string, Record<string, any>][]) {
  buffer.forEach(([_, { app, component }]) => {
    updatePinia(component)
    updateApp(app, component)
  })
}

export const hookApi = {
  hook: client.value.hook,
  subscribe: subscribeHook,
  publish: publishHook,
}
