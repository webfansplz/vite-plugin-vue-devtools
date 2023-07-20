import { isVUE, parseSFC, walkAST } from './common'

// TODO: support more, currently only analyze <script setup>
export function analyzeByTraceRerender(code: string, filename: string) {
  if (isVUE(filename))
    return code

  const { scriptSetup, getScriptAST, getScriptSetupAST } = parseSFC(code, filename)

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
