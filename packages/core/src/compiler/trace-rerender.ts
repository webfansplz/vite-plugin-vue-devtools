import type MS from 'magic-string'
import { entries } from './common/utils'
import { type InsertLocation, ensureImport } from './common'

export function analyzeByTraceRerender(code: MS, locations: InsertLocation[]) {
  const apiNames = {
    getCurrentInstance: '__VUE_DEVTOOLS_$getCurrentInstance__',
    onRenderTracked: '__VUE_DEVTOOLS_$onRenderTracked__',
    onRenderTriggered: '__VUE_DEVTOOLS_$onRenderTriggered__',
  }

  const injectedCodes = {
    onRenderTracked: `
    \n;${apiNames.onRenderTracked}((e) => {
      const instance = ${apiNames.getCurrentInstance}()
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:tracked', e, instance)
    });\n`,
    onRenderTriggered: `
    \n;${apiNames.onRenderTriggered}((e) => {
      const instance = ${apiNames.getCurrentInstance}()
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:triggered', e, instance)
    });\n`,
  }

  // to avoid duplicate injection
  const currentCode = code.toString()
  const shouldInject = Object.entries(apiNames).map(([, alias]) => {
    return !currentCode.includes(alias)
  }).every(Boolean)

  if (!shouldInject)
    return code

  locations.forEach(({ start, end }, idx) => {
    if (idx === 0) {
      code = ensureImport(code, {
        vue: entries(apiNames).map(([id, alias]) => ({
          id, alias,
        })),
      }, start)
    }

    entries(injectedCodes).forEach(([, appendCode]) => {
      code.prependLeft(end, appendCode)
    })
  })

  return code
}
