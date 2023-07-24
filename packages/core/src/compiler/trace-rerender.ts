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
    colors: '__VUE_DEVTOOLS_$colors__',
    debounce: '__VUE_DEVTOOLS_$debounce__',
    highlightEl: '__VUE_DEVTOOLS_$highlightEl__',
    times: '__VUE_DEVTOOLS_$times__',
    debounceFn: '__VUE_DEVTOOLS_$debounceFn__',
  }

  const hlPrependCodes = `
    ;const ${variableNames.colors} = [
    ['#ff000033', 100],
    ['#7f000033', 50],
    ['#ffff0033', 20],
    ['#7f7f0033', 10],
    ['#00800033', 5],
    ['#00400033', 0],
  ]

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

  const hlFn = `(el) => {
    if (${variableNames.highlightEl}) {
      ${variableNames.highlightEl}.style.backgroundColor = ${variableNames.colors}.find(([color, time]) => ${variableNames.times} >= time)[0]
      ${variableNames.times} += 1
    }
    else {
      el.style.backgroundColor = ${variableNames.colors}.at(-1)[0]
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
