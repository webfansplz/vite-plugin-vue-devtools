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

// print for iframe console
window.print = (...s) => {
  console.log('print', ...s)
}

const iframeId = '__vue_devtools_iframe__'

let id = 0

function injectDevtools() {
  const iframe = document.createElement('iframe')
  iframe.id = iframeId
  iframe.src = 'http://localhost:5173/__devtools/'
  iframe.style.position = 'fixed'
  iframe.style.bottom = '0'
  iframe.style.left = '50%'
  iframe.style.transform = 'translateX(-50%)'
  iframe.style.width = '1200px'
  iframe.style.height = '600px'
  document.body.appendChild(iframe)
}

const timelineEvent = []

window.__VUE_DEVTOOLS_GET_TIMELINE_EVENT__ = function () {
  const sortKey = {
    start: -1,
    end: 1,
  }
  return timelineEvent.sort((a, b) => a.sortTime - b.sortTime).sort((a, b) => sortKey[a.event.data.measure] - sortKey[b.event.data.measure])
}

hook.on('app:init', (app) => {
  window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
    return app._instance
  }
})

hook.on('perf:start', (app, uid, component, type, time) => {
  timelineEvent.push({
    layerId: 'perfomance',
    groupKey: `${uid}-${type}`,
    sortTime: id++,
    event: {
      time,
      now: Date.now(),
      data: {
        component,
        name: component.type.__name,
        type,
        measure: 'start',
      },
    },
  })
})

hook.on('perf:end', async (app, uid, component, type, time) => {
  const item = timelineEvent.reverse().find(item => item.groupKey === `${uid}-${type}`)
  timelineEvent.push({
    layerId: 'perfomance',
    groupKey: `${uid}-${type}`,
    sortTime: id++,
    event: {
      time,
      now: item.event.now,
      data: {
        component,
        name: component.type.__name,
        type,
        measure: 'end',
        duration: `${time - item.event.time}ms`,
      },
    },
  })

  //
  window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
    return component
  }
  const contentWindow = document.getElementById(iframeId)?.contentWindow
  contentWindow?.postMessage('update', 'http://localhost:5173/__devtools/')
})

injectDevtools()
