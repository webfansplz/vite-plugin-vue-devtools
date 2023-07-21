import type { Identifier } from '@babel/types'
import { getObjectFnBodyLocation, isObjectFn, walkAST } from './ast'
import type { InsertLocation } from './parse'
import { parseSFC } from './parse'
import { SETUP_FN } from './constants'

/**
 * @returns insert code location
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
          if (name === SETUP_FN) {
            const loc = getObjectFnBodyLocation(node)
            location = loc
              ? {
                  start: offset,
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
