// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { DebuggerEvent } from 'vue'
import { MutationType } from 'pinia'
import type { StateTree } from 'pinia'
import { timelineApi } from './timeline'

const LAYER_ID = 'pinia'
export const piniaVisible = ref(false)
const stores = ref()
const subscribes = ref<Record<string, Function>>({})
export const piniaStoresId = ref<string>([])
export const piniaStoresCategory = computed(() => ['🍍 Pinia (root)', ...piniaStoresId.value.sort()])
export const piniaState = ref<Record<string, unknown>>({})
export const piniaGetters = ref<Record<string, unknown>>({})

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

function subscribeStore(store) {
  const action = store.$onAction(({ after, onError, name, args }) => {
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

  if (subscribes.value[store.$id])
    subscribes.value[store.$id].push(action)

  else
    subscribes.value[store.$id] = [action]

  store._customProperties.forEach((name) => {
    const stop = watch(
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

    subscribes.value[store.$id].push(stop)
  })

  const subscribe = store.$subscribe(
    ({ events, type }, _) => {
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

  subscribes.value[store.$id].push(subscribe)

  store._hotUpdate = markRaw((_) => {
    timelineApi.addTimelineEvent({
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
  Object.values(stores.value)?.forEach((store) => {
    let insertIndex = -1
    if (piniaStoresId.value.includes(store.$id)) {
      subscribes.value[store.$id].forEach(stop => stop())
      subscribes.value[store.$id] = []
      delete piniaState.value[store.$id]
      delete piniaGetters.value[store.$id]
      insertIndex = piniaStoresId.value.indexOf(store.$id)
      piniaStoresId.value.splice(insertIndex, 1)
    }
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

    if (insertIndex)
      piniaStoresId.value.splice(insertIndex, 0, store.$id)
    else
      piniaStoresId.value.push(store.$id)

    subscribeStore(store)
  })
}

export function updatePinia(component) {
  const proxy = component?.proxy
  if (!proxy || !('_pStores' in proxy))
    return
  const _stores = proxy?._pStores
  if (!_stores)
    return
  stores.value = null
  nextTick(() => {
    piniaVisible.value = !!_stores
    stores.value = _stores
    normalizePiniaInfo()
  })
}

export function initPinia() {
  timelineApi.addTimelineLayer({
    id: LAYER_ID,
    label: 'Pinia 🍍',
  })
}
