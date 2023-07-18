import { DevToolsHooks } from '@vite-plugin-vue-devtools/core'
import type { DebuggerEvent } from 'vue'
import { updatePinia } from './pinia'
import { instance, updateApp, app as vueApp } from './app'
import { useDevToolsClient } from './client'
import { getSetupStateInfo, toRaw } from '~/logic/components/data'

type ComponentInstance = any // @TODO

function hideInDevtools(component) {
  return component?.root?.type?.devtools?.hide
}

const client = useDevToolsClient()

function subscribeHook() {
  const client = useDevToolsClient()
  const hook = client.value.hook
  hook.on(DevToolsHooks.APP_INIT, (app) => {
    if (app?._vueDevtools_hidden_)
      return
    vueApp.value = app
    instance.value = app._instance
  })

  function skipCollect(app, uid, component) {
    return (!app || (typeof uid !== 'number' && !uid) || !component || hideInDevtools(component))
  }

  hook.on(DevToolsHooks.RENDER_TRACKED, (e: DebuggerEvent, instance: ComponentInstance) => {
    // console.log(processSetupState(instance))
    // console.log(getSetupStateInfo(e.target))
    // console.log('track', e, instance.setupState, instance.devtoolsRawSetupState)
  })

  hook.on(DevToolsHooks.RENDER_TRIGGERED, (e: DebuggerEvent, instance: ComponentInstance) => {
    // data type
    const info = getSetupStateInfo(e.target)
    const dataType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
    // key
    const index = Object.values(instance.devtoolsRawSetupState).map(i => toRaw(i)).indexOf(e.target)
    const key = Object.keys(instance.devtoolsRawSetupState)[index]
    // value
    const value = !dataType || info.reactive ? e.target[e.key] : e.target.value
    // update type
    console.log('xxx', key, dataType, value, e.type)
    // console.log('trigger', e, instance.setupState, instance.devtoolsRawSetupState)
  })

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
