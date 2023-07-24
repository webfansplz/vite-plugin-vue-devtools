import type { Identifier, Node, ObjectMethod, ObjectProperty } from '@babel/types'
import { getObjectFnBodyLocation, isCallOf, isObjectFn, walkAST } from './ast'
import type { InsertLocation } from './parse'
import { babelParse, parseSFC } from './parse'
import { DEFINE_COMPONENT, SETUP_FN } from './constants'

function isSetupFn(node: Node): node is ObjectMethod | ObjectProperty {
  return isObjectFn(node) && (node.key as Identifier).name === SETUP_FN
}

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
        if (isSetupFn(node)) {
          const loc = getObjectFnBodyLocation(node)
          location = loc
            ? {
                start: offset,
                end: offset + loc.end,
              }
            : null
          this.skip()
        }
      },
    })
    return location
  }

  return scriptSetup ? scriptSetupLocation : scriptLocation
}

// e.g. js, jsx, ts, tsx
export function analyzeScriptFile(code: string, lang: string) {
  if (!code.trim().length || !code.includes(DEFINE_COMPONENT))
    return null
  const location: (InsertLocation | null)[] = []
  const ast = babelParse(code, lang)
  walkAST(ast, {
    enter(node) {
      if (isCallOf(node, DEFINE_COMPONENT) && node.arguments[0] && node.arguments[0].type === 'ObjectExpression') {
        for (const stmt of node.arguments[0].properties) {
          if (isSetupFn(stmt)) {
            const loc = getObjectFnBodyLocation(stmt)
            location.push(loc
              ? {
                  start: ast.start ?? 0,
                  end: loc.end,
                }
              : null)
            this.skip()
          }
        }
      }
    },
  })
  return location.filter(Boolean) as InsertLocation[]
}
