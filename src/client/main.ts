// register vue composition api globally
import { createApp } from 'vue'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import App from './App.vue'
import { connect } from './logic/hook'
import { initClient } from './logic/global'

import '@unocss/reset/tailwind.css'
import './styles/main.css'

// import './styles/cm.css'
import 'uno.css'

initClient()

connect()

window.console.log = window.parent.print

const app = createApp(App)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
app.use(router)
app.use(FloatingVue)
app.mount('#app')
