import { parseSFC, walkAST } from './common'
import { isVUE } from './lang'

export function analyzeByTraceRerender(code: string, filename: string) {
  if (isVUE(filename))
    return code

  const { scriptSetup, getScriptAST, getScriptSetupAST, sfc } = parseSFC(code, filename)

  if (!scriptSetup)
    return

  const setupAST = getScriptSetupAST()!

  walkAST(setupAST, {
    enter(node) {
      console.log(node)
    },
  })

  return code
}
