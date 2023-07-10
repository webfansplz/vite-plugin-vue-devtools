import type { App, ComponentInternalInstance } from 'vue'
import { hookApi } from './hook'

export const app = shallowRef<App<Element>>()
export const vueVersion = computed(() => app.value?.version)
export const instance = shallowRef<ComponentInternalInstance>()
export const router = computed(() => app.value?.config?.globalProperties?.$router)
export const currentRoute = computed(() => unref(router.value?.currentRoute))
export const routes = computed(() => {
  const routesMap = new Map()
  return (router.value?.getRoutes() || []).filter(i => !routesMap.has(i.path) && routesMap.set(i.path, 1))
})

export function initApp(params) {
  const [_, { app: _app }] = params
  if (_app) {
    app.value = _app
    triggerRef(app)

    hookApi.hook?.emit('init:vue:app')
  }
  // Update router Manually
  router.value?.afterEach(() => {
    triggerRef(router)
  })
}

export function updateApp(_app, component) {
  if (_app) {
    app.value = _app
    triggerRef(app)
  }

  if (component.root) {
    instance.value = component.root
    instance.value && (instance.value.uid = 0)
    triggerRef(instance)
  }
}

export function onVueInstanceUpdate(cb: (i: ComponentInternalInstance) => void) {
  return watch(instance, () => {
    cb(instance.value!)
  }, {
    immediate: true,
  })
}
