import type { App, ComponentInternalInstance } from 'vue'

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
