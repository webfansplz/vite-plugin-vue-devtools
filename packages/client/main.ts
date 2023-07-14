import { createApp } from 'vue'
import 'floating-vue/dist/style.css'
import App from './App.vue'

// import { createDevToolsClient } from './logic/global'

import '@unocss/reset/tailwind.css'
import './styles/main.css'

import 'uno.css'

// createDevToolsClient()

const app = createApp(App)
// const router = createRouter({
//   history: createMemoryHistory(),
//   routes,
// })

// app.use(router)
// app.use(FloatingVue)
app.mount('#app')
