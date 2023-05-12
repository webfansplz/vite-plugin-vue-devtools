import { createApp, h } from 'vue'
import App from 'virtual:vue-devtools-path:Container.vue'

function load() {
  const CONTAINER_ID = '__vue-devtools-container__'
  const el = document.createElement('div')
  el.setAttribute('id', CONTAINER_ID)
  el.setAttribute('data-v-inspector-ignore', 'true')
  document.getElementsByTagName('body')[0].appendChild(el)
  createApp({
    render: () => h(App),
    devtools: {
      hide: true,
    },
  }).mount(el)
}
load()
