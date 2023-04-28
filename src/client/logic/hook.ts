import { instance, app as vueApp } from './instance'

export const hook = window.parent.__GET_VUE_DEVTOOLS_GLOBAL_HOOK__()

const enum DevtoolsHooks {
  COMPONENT_INIT = 'app:init',
  COMPONENT_UPDATED = 'component:updated',
  COMPONENT_ADDED = 'component:added',
  COMPONENT_REMOVED = 'component:removed',
  COMPONENT_EMIT = 'component:emit',
}

export function connect() {
  hook.on(DevtoolsHooks.COMPONENT_INIT, (app) => {
    vueApp.value = app
    instance.value = app._instance
  })

  hook.on(DevtoolsHooks.COMPONENT_UPDATED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component)
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
    if (!app || (typeof uid !== 'number' && !uid) || !component)
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

  hook.on(DevtoolsHooks.COMPONENT_REMOVED, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component)
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

  hook.on(DevtoolsHooks.COMPONENT_EMIT, (app, uid, parentUid, component) => {
    if (!app || (typeof uid !== 'number' && !uid) || !component)
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
}
