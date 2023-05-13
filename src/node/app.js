import { createApp, h } from 'vue'
import App from 'virtual:vue-devtools-path:Container.vue'

const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ??= {
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
}

function load() {
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
load()
