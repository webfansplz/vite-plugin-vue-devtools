// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { DebuggerEvent } from 'vue'
import { MutationType } from 'pinia'
import type { StateTree } from 'pinia'
import { timelineApi } from './timeline'

const piniaVisible = ref(false)
const stores = ref()
export const piniaStoresId = ref<string>(['🍍 Pinia (root)'])
export const piniaState = ref<Record<string, unknown>>({})
export const piniaGetters = ref<Record<string, unknown>>({})
const LAYER_ID = 'pinia'

function formatEventData(
  events: DebuggerEvent[] | DebuggerEvent | undefined,
) {
  if (!events)
    return {}
  if (Array.isArray(events)) {
    // TODO: handle add and delete for arrays and objects
    return events.reduce(
      (data, event) => {
        data.keys.push(event.key)
        data.operations.push(event.type)
        data.oldValue[event.key] = event.oldValue
        data.newValue[event.key] = event.newValue
        return data
      },
      {
        oldValue: {} as Record<string, any>,
        keys: [] as string[],
        operations: [] as string[],
        newValue: {} as Record<string, any>,
      },
    )
  }
  else {
    return {
      operation: events.type,
      key: events.key,
      oldValue: events.oldValue,
      newValue: events.newValue,
    }
  }
}

function formatMutationType(type: MutationType): string {
  switch (type) {
    case MutationType.direct:
      return 'mutation'
    case MutationType.patchFunction:
      return '$patch'
    case MutationType.patchObject:
      return '$patch'
    default:
      return 'unknown'
  }
}

function subscribeStoreChanged(store) {
  store.$onAction(({ after, onError, name, args }) => {
    timelineApi.addTimelineEvent({
      layerId: LAYER_ID,
      event: {
        time: Date.now(),
        title: `🛫 ${name}`,
        subtitle: 'start',
        now: Date.now(),
        data: {
          store: store.$id,
          action: name,
          args,
        },
      },
    })

    after((result) => {
      timelineApi.addTimelineEvent({
        layerId: LAYER_ID,
        event: {
          time: Date.now(),
          title: `🛬 ${name}`,
          subtitle: 'end',
          now: Date.now(),
          data: {
            store: store.$id,
            action: name,
            args,
            result,
          },
        },
      })
    })

    onError((error) => {
      timelineApi.addTimelineEvent({
        layerId: LAYER_ID,
        event: {
          now: Date.now(),
          time: Date.now(),
          logType: 'error',
          title: `💥 ${name}`,
          subtitle: 'end',
          data: {
            store: store.$id,
            action: name,
            args,
            error,
          },
        },
      })
    })
  }, true)
  store._customProperties.forEach((name) => {
    watch(
      () => unref<unknown>(store[name]),
      (newValue, oldValue) => {
        timelineApi.addTimelineEvent({
          layerId: LAYER_ID,
          event: {
            now: Date.now(),
            time: Date.now(),
            title: 'Change',
            subtitle: name,
            data: {
              newValue,
              oldValue,
            },
          },
        })
      },
      { deep: true },
    )
  })

  store.$subscribe(
    ({ events, type }, state) => {
      const eventData = {
        time: Date.now(),
        now: Date.now(),
        title: formatMutationType(type),
        data: Object.assign(
          { store: store.$id },
          formatEventData(events),
        ),
      }

      if (type === MutationType.patchFunction)
        eventData.subtitle = '⤵️'

      else if (type === MutationType.patchObject)
        eventData.subtitle = '🧩'

      else if (events && !Array.isArray(events))
        eventData.subtitle = events.type

      // if (events) {
      //   eventData.data['rawEvent(s)'] = {
      //     _custom: {
      //       display: 'DebuggerEvent',
      //       type: 'object',
      //       tooltip: 'raw DebuggerEvent[]',
      //       value: events,
      //     },
      //   }
      // }

      timelineApi.addTimelineEvent({
        layerId: LAYER_ID,
        event: eventData,
      })
    },
    { detached: true, flush: 'sync' },
  )

  store._hotUpdate = markRaw((newStore) => {
    timeApi.addTimelineEvent({
      layerId: LAYER_ID,
      event: {
        time: Date.now(),
        now: Date.now(),
        title: `🔥 ${store.$id}`,
        subtitle: 'HMR update',
        data: {
          store: store.$id,
          info: 'HMR update',
        },
      },
    })
  })
}

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

    subscribeStoreChanged(store)
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
    timelineApi.addTimelineLayer({
      id: 'pinia',
      label: 'Pinia 🍍',
    })
  }
}
