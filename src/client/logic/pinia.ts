// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { StateTree } from 'pinia'

const piniaVisible = ref(false)
const stores = ref()
export const piniaStoresId = ref<string>(['🍍 Pinia (root)'])
export const piniaState = ref<Record<string, unknown>>({})
export const piniaGetters = ref<Record<string, unknown>>({})

function normalizePiniaInfo() {
  piniaStoresId.value = ['🍍 Pinia (root)']
  Object.values(stores.value)?.forEach((store) => {
    const state = store._isOptionsAPI
      ? toRaw(store.$state)
      : Object.keys(store.$state).reduce((state, key) => {
        state[key] = store.$state[key]
        return state
      }, {} as StateTree)
    piniaState.value[store.$id] = state

    if (store._getters && store._getters.length) {
      piniaGetters.value[store.$id] = store._getters.reduce((getters, key) => {
        getters[key] = store[key]
        return getters
      }, {} as _GettersTree<StateTree>)
    }
    piniaStoresId.value.push(store.$id)
  })
}

export function initPinia() {
  const app = window.parent.__VUE_DEVTOOLS_GET_VUE_APP__()
  const proxy = app._instance.proxy
  const _stores = proxy?._pStores
  piniaVisible.value = !!_stores
  // consola('piniaVisible', piniaVisible.value)
  if (_stores) {
    stores.value = _stores
    normalizePiniaInfo()
  }
}
