import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
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

const routes = [
  { path: '/', component: Home },
  {
    path: '/about',
    component: About,
    children: [
      { path: '/about/1', component: About },
    ],
  },
  { path: '/:articleName', component: About },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

app.use(router)
app.use(pinia)
app.mount('#app')

// const a = app._instance
