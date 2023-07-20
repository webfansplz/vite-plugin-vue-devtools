import type MS from 'magic-string'
import { entries } from './common/utils'
import { ensureImport } from './common'

export function analyzeByTraceRerender(code: MS) {
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
    });\n
    `,
    onRenderTriggered: `
    \n;${apiNames.onRenderTriggered}((e) => {
      const instance = ${apiNames.getCurrentInstance}()
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:triggered', e, instance)
    });\n
    `,
  }

  code = ensureImport(code, {
    vue: entries(apiNames).map(([id, alias]) => ({
      id, alias,
    })),
  })

  entries(injectedCodes).forEach(([, appendCode]) => {
    code.append(appendCode)
  })

  return code
}
