import { createApp, h } from 'vue'
import App from 'virtual:vue-devtools-path:Container.vue'

const CONTAINER_ID = '__vue-devtools-container__'

// reuse __VUE_DEVTOOLS_ (@vuejs/devtools) instance first
const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ??= {
  events: new Map(),
  on(event, fn) {
    if (!this.events.has(event))
      this.events.set(event, [])

    this.events.get(event).push(fn)
  },
  emit(event, ...payload) {
    if (this.events.has(event))
      this.events.get(event).forEach(fn => fn(...payload))
  },
}

function load() {
  const el = document.createElement('div')
  el.setAttribute('id', CONTAINER_ID)
  el.setAttribute('data-v-inspector-ignore', 'true')
  document.getElementsByTagName('body')[0].appendChild(el)
  createApp({
    render: () => h(App, { hook }),
    devtools: {
      hide: true,
    },
  }).mount(`#${CONTAINER_ID}`)
}

window.__VUE_DEVTOOLS_GET_GLOBAL_HOOK__ = function () {
  return hook
}

// print for iframe console
window.print = (...s) => {
  console.log('print', ...s)
}

const performanceTimeline = []
let performanceTimelineSortId = 0
const performTimelineSortKey = {
  start: -1,
  end: 1,
}

window.__VUE_DEVTOOLS_GET_PERFORMANCE_TIMELINE__ = function () {
  const data = performanceTimeline
    // .sort((a, b) => a.sortId - b.sortId)
    .sort((a, b) => performTimelineSortKey[a.event.data.measure] - performTimelineSortKey[b.event.data.measure])
    .sort((a, b) => a.event.time - b.event.time)

  return data
}

hook.on('app:init', (app) => {
  // console.log('init', app)
})

hook.on('perf:start', (app, uid, component, type, time) => {
  const filename = component.type.__file?.match(/\/?([^/]+?)(\.[^/.]+)?$/)?.[1]
  const name = component.type.__name ?? component.type.name ?? filename
  if (!name)
    return

  performanceTimeline.push({
    layerId: 'performance',
    groupKey: `${uid}-${type}`,
    sortId: performanceTimelineSortId++,

    event: {
      title: name,
      subtitle: type,
      time,
      now: Date.now(),
      data: {
        component: name,
        // name,
        type,
        measure: 'start',
      },
    },
  })
})

hook.on('perf:end', async (app, uid, component, type, time) => {
  const filename = component.type.__file?.match(/\/?([^/]+?)(\.[^/.]+)?$/)?.[1]
  const name = component.type.__name ?? component.type.name ?? filename
  if (!name)
    return
  const item = performanceTimeline.reverse().find(item => item.groupKey === `${uid}-${type}`)
  performanceTimeline.push({
    layerId: 'performance',
    groupKey: `${uid}-${type}`,
    sortId: performanceTimelineSortId++,

    event: {
      title: name,
      subtitle: type,
      time,
      now: Date.now(),
      data: {
        component: name,
        // name,
        type,
        measure: 'end',
        duration: `${time - item.event.time}ms`,
      },
    },
  })
})

load()
