import type { App, ComponentInternalInstance } from 'vue'
import { initPages } from './pages'

export const app = shallowRef<App<Element>>()

export const vueVersion = computed(() => app.value?.version)

// TODO: multi vue instance
export const instance = shallowRef<ComponentInternalInstance>()

export function onVueInstanceUpdate(cb: (i: ComponentInternalInstance) => void) {
  return watch(instance, () => {
    cb(instance.value!)
  }, {
    immediate: true,
  })
}

export function initVueApp(_app, component) {
  if (_app) {
    app.value = _app
    triggerRef(app)
    initPages()
  }

  if (component.root) {
    instance.value = component.root
    instance.value && (instance.value.uid = 0)
    triggerRef(instance)
  }
}
