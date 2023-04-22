import { createApp } from 'vue'

import { createPinia } from 'pinia'
import './style.css'

import App from './App.vue'

const pinia = createPinia()

// pinia.use((ctx) => {
//   ctx.store.$subscribe((r) => {
//     console.log(r)
//   })
//   ctx.store.$onAction(({ after, name, args }) => {
//     console.log('2', name, args)
//     after((result) => {
//       console.log('result', result)
//     })
//   })
// })
const app = createApp(App)

app.use(pinia)
app.mount('#app')

// const a = app._instance
