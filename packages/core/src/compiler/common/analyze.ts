import type { Identifier } from '@babel/types'
import { getObjectFnBodyOffset, isObjectFn, walkAST } from './ast'
import type { InsertLocation } from './parse'
import { parseSFC } from './parse'

/**
 * @returns insert code offset
 */
export function analyzeVueSFC(code: string, filename: string) {
  const {
    scriptSetup,
    scriptSetupLocation,
    script,
    scriptLocation,
    getScriptAST,
  } = parseSFC(code, filename)

  if (!scriptSetup && !script)
    return null

  // script setup: start: after <script>, end: before </script>
  // script only: start: after <script>, end: before `setup` function
  // script setup and script: just use scriptSetup

  if (!scriptSetup && script) {
    const offset = scriptLocation.start
    const ast = getScriptAST()!
    let location: InsertLocation | null = null
    walkAST(ast, {
      enter(node) {
        if (isObjectFn(node)) {
          const name = (node.key as Identifier).name
          if (name === 'setup') {
            const loc = getObjectFnBodyOffset(node)
            location = loc
              ? {
                  start: offset + loc.start,
                  end: offset + loc.end,
                }
              : null
            this.skip()
          }
        }
      },
    })
    return location
  }

  return scriptSetup ? scriptSetupLocation : scriptLocation
}
