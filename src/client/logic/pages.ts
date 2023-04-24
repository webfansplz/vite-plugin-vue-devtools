import type { Router } from 'vue-router'

export const router = ref<Router>()
export const currentRoute = computed(() => unref(router.value?.currentRoute))

export const routes = computed(() => {
  return (router.value?.getRoutes() || [])
    .map((i) => {
      return {
        ...i,
      }
    })
})
export function initPages() {
  const app = window.parent.__VUE_DEVTOOLS_GET_VUE_APP__()
  router.value = app.config.globalProperties.$router
  // Update router Manually
  router.value?.afterEach(() => {
    triggerRef(router)
  })
}
