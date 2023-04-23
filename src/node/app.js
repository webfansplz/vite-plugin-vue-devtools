// Reuse __VUE_DEVTOOLS_ instance first
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

hook.on('app:init', async (app) => {
  window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
    return app._instance
  }
})

hook.on('perf:start', async (_, __, component) => {
  console.log('perf:start')
})

hook.on('perf:end', async (_, __, component) => {
  window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
    return component
  }
  const contentWindow = document.getElementById(iframeId)?.contentWindow
  contentWindow?.postMessage('update', 'http://localhost:5173/__devtools/')
})

injectDevtools()
