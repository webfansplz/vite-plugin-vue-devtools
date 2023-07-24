import type MS from 'magic-string'
import { entries } from './common/utils'
import { type InsertLocation, ensureImport } from './common'

export function analyzeByTraceRerender(code: MS, location: InsertLocation) {
  const apiNames = {
    getCurrentInstance: '__VUE_DEVTOOLS_$getCurrentInstance__',
    onRenderTracked: '__VUE_DEVTOOLS_$onRenderTracked__',
    onRenderTriggered: '__VUE_DEVTOOLS_$onRenderTriggered__',
  }

  const variableNames = {
    // highlight rerender inject codes
    debounce: '__VUE_DEVTOOLS_$debounce__',
    highlightEl: '__VUE_DEVTOOLS_$highlightEl__',
    times: '__VUE_DEVTOOLS_$times__',
    debounceFn: '__VUE_DEVTOOLS_$debounceFn__',
  }

  const hlPrependCodes = `
  function ${variableNames.debounce}(fn, delay) {
    let timer = null
    return function () {
      if (timer)
        clearTimeout(timer)

      timer = setTimeout(() => {
        fn.apply(this, arguments)
        timer = null
      }, delay)
    }
  };

  let ${variableNames.highlightEl} = null
  let ${variableNames.times} = 0
  const ${variableNames.debounceFn} = ${variableNames.debounce}(() => {
    document.body.removeChild(${variableNames.highlightEl})
    ${variableNames.highlightEl} = null
    ${variableNames.times} = 0
  }, 3000)
  `

  const hlFn = `(el, getHeaderContent) => {
    if (${variableNames.highlightEl}) {
      ${variableNames.times} += 1
      const header = ${variableNames.highlightEl}.children[0]
      header.replaceChildren(...getHeaderContent(${variableNames.times}))
    }
    else {
      ${variableNames.highlightEl} = el
      document.body.appendChild(el)
    }
    ${variableNames.debounceFn}()
  }`

  const injectedCodes = {
    onRenderTracked: `
    \n;${apiNames.onRenderTracked}((e) => {
      const instance = ${apiNames.getCurrentInstance}()
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:tracked', e, instance)
    });\n`,
    onRenderTriggered: `
    \n;${apiNames.onRenderTriggered}((e) => {
      const instance = ${apiNames.getCurrentInstance}()
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:triggered', e, instance, ${hlFn})
    });\n`,
  }

  code = ensureImport(code, {
    vue: entries(apiNames).map(([id, alias]) => ({
      id, alias,
    })),
  }, location.start)

  entries(injectedCodes).forEach(([, appendCode]) => {
    code.prependLeft(location.end, appendCode)
  })
  code.prependLeft(location.end, hlPrependCodes)

  return code
}
