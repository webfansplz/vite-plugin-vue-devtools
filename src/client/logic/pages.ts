import type { Router } from 'vue-router'
import { app } from './instance'

export const router = ref<Router>()
export const currentRoute = computed(() => unref(router.value?.currentRoute))

const map = new Map()
export const routes = computed(() => {
  return (router.value?.getRoutes() || [])
    .map((i) => {
      return {
        ...i,
      }
    }).filter(i => !map.has(i.path) && map.set(i.path, 1))
})
export function initPages() {
  router.value = app.value?.config.globalProperties.$router
  // Update router Manually
  router.value?.afterEach(() => {
    triggerRef(router)
  })
}
