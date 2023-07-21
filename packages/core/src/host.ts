import { createApp, h } from 'vue'
import type { Component } from 'vue'
import { createDevToolsHook } from './hook'

export function createDevToolsContainer(App: Component) {
  const hook = createDevToolsHook()
  const CONTAINER_ID = '__vue-devtools-container__'
  const el = document.createElement('div')
  el.setAttribute('id', CONTAINER_ID)
  el.setAttribute('data-v-inspector-ignore', 'true')
  document.getElementsByTagName('body')[0].appendChild(el)
  createApp({
    render: () => h(App, { hook }),
    devtools: {
      hide: true,
    },
  }).mount(el)
}
