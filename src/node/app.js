const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__

const iframe = document.createElement('iframe')
iframe.id = '_devtools'
iframe.src = 'http://localhost:5173/__devtools/'
iframe.style.position = 'fixed'
iframe.style.bottom = '0'
iframe.style.left = '50%'
iframe.style.transform = 'translateX(-50%)'
iframe.style.width = '1200px'
iframe.style.height = '600px'
document.body.appendChild(iframe)

window.print = (...s) => {
  console.log('print', ...s)
}
if (hook) {
  // Reuse __VUE_DEVTOOLS_ instance
  hook.on('app:init', async (app) => {
    // console.log('Vue APP', app)
    window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
      return app._instance
    }
    // const state = getInstanceState(app._instance)
    // const walker = new ComponentWalker(500, null, true)
    // const tree = await walker.getComponentTree(app._instance)
    // console.log(app._instance)
    // console.log(tree)
    // console.log(getInstanceState(tree[0]?.children?.[0]?.instance))
  })
  hook.on('perf:end', async (app, _, component) => {
    window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
      return component
    }
    const w = document.getElementById('_devtools').contentWindow
    w.postMessage('update', 'http://localhost:5173/__devtools/')
  })
}
else {
  // TODO: event emitter
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__ = {
    on: async (event, payload, _, component) => {
      if (event === 'app:init') {
        window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
          return payload._instance
        }
      }
      else if (event === 'perf:end') {
        window.__VUE_DEVTOOLS_GET_VUE_INSTANCE__ = function () {
          return component
        }
        const w = document.getElementById('_devtools').contentWindow
        w.postMessage('update', 'http://localhost:5173/__devtools/')
      }
    },
    emit(event, ...payload) {
      this.on(event, ...payload)
    },
  }
}
