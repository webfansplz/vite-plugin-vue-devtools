import { instance, app as vueApp } from './instance'

import { useClient } from './client'

// export const hook = window.parent.__VUE_DEVTOOLS_GET_GLOBAL_HOOK__()

const enum DevtoolsHooks {
  COMPONENT_INIT = 'app:init',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
}

function hideInDevtools(app) {
  return app?._vueDevtools_hidden_ || app._instance?.type?.devtools?.hide
}

export function connect() {
  const client = useClient()
  console.log('hooo', client.value)
  const hook = client.value!.hook!
  hook.on(DevtoolsHooks.COMPONENT_INIT, (app) => {
    // console.log('init', app)
    if (app?._vueDevtools_hidden_)
      return
    vueApp.value = app
    instance.value = app._instance
  })

  hook.on(DevtoolsHooks.COMPONENT_UPDATED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(app))
      return

    if (app) {
      vueApp.value = app
      triggerRef(vueApp)
    }

    if (component.root) {
      instance.value = component.root
      instance.value && (instance.value.uid = 0)
      triggerRef(instance)
    }
  })

  hook.on(DevtoolsHooks.COMPONENT_ADDED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(app))
      return

    console.log('added')
    if (app) {
      vueApp.value = app
      triggerRef(vueApp)
    }

    if (component.root) {
      instance.value = component.root
      instance.value && (instance.value.uid = 0)
      triggerRef(instance)
    }
  })

  hook.on(DevtoolsHooks.COMPONENT_REMOVED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(app))
      return

    console.log('removed')

    if (app) {
      vueApp.value = app
      triggerRef(vueApp)
    }

    if (component.root) {
      instance.value = component.root
      instance.value && (instance.value.uid = 0)
      triggerRef(instance)
    }
  })

  hook.on(DevtoolsHooks.COMPONENT_EMIT, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(app))
      return

    console.log('component:emit')

    if (app) {
      vueApp.value = app
      triggerRef(vueApp)
    }

    if (component.root) {
      instance.value = component.root
      instance.value && (instance.value.uid = 0)
      triggerRef(instance)
    }
  })
}
