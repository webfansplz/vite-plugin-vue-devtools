import { updatePinia } from './pinia'
import { instance, updateApp, app as vueApp } from './app'
import { useDevtoolsClient } from './client'

enum DevtoolsHooks {
  APP_INIT = 'app:init',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
}

function hideInDevtools(component) {
  return component?.root?.type?.devtools?.hide
}

const client = useDevtoolsClient()

function produceHook() {
  const client = useDevtoolsClient()
  const hook = client.value.hook
  hook.on(DevtoolsHooks.APP_INIT, (app) => {
    if (app?._vueDevtools_hidden_)
      return
    vueApp.value = app
    instance.value = app._instance
  })

  function skipCollect(app, uid, component) {
    return (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
  }

  hook.on(DevtoolsHooks.COMPONENT_UPDATED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    updateApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('added')
    updateApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_REMOVED, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('removed')

    updateApp(app, component)
  })

  hook.on(DevtoolsHooks.COMPONENT_EMIT, (app, uid, parentUid, component) => {
    updatePinia(component)

    if (skipCollect(app, uid, component))
      return

    // console.log('component:emit')

    updateApp(app, component)
  })
}

function ConsumeHook(buffer: [string, Record<string, any>][]) {
  buffer.forEach(([_, { app, component }]) => {
    updatePinia(component)
    updateApp(app, component)
  })
}

export const hookApi = {
  hook: client.value.hook,
  produce: produceHook,
  consume: ConsumeHook,
}
