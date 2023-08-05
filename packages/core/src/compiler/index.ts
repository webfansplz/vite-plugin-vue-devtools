import MagicString from 'magic-string'
import type { InsertLocation } from './common'
import { analyzeScriptFile, analyzeVueSFC, isAcceptableLang, isVUE } from './common'
import { analyzeByTraceRerender } from './trace-rerender'
import { entries } from './common/utils'
import { collect } from './state-analyze'

export interface AnalyzeOptions {
  /**
   * @default true
   */
  rerenderTrace: boolean
  /**
   * @default true
   */
  stateAnalyze: boolean
}

const excludePaths = ['node_modules']

function enableAnalyze(config: AnalyzeOptions) {
  return entries(config).some(([, enable]) => enable)
}

function hitPaths(filename: string, paths: string[]) {
  return paths.some(path => filename.includes(path))
}

export const analyzeOptionsDefault = {
  rerenderTrace: true,
  stateAnalyze: true,
} satisfies AnalyzeOptions

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : Required<T[P]>;
}

export function analyzeCode(code: string, filename: string, options: AnalyzeOptions) {
  /**
   * 1. check if the file is acceptable
   * 2. check if the file is excluded
   * 3. check if the analyze is enabled
   * one of the above is false, return null
   */
  if (!isAcceptableLang(filename) || !enableAnalyze(options) || hitPaths(filename, excludePaths))
    return null

  let locations: InsertLocation[] | null = null
  let codeLang = ''
  let pureScriptCode = code
  let offsetContent = ''

  if (isVUE(filename)) {
    const result = analyzeVueSFC(code, filename)
    if (result) {
      result.location && (locations = [result.location])
      codeLang = result.lang
      pureScriptCode = result.pureScriptCode
      offsetContent = result.offsetScriptHeader
    }
  }
  else {
    const lang = filename.split('.').pop()!
    codeLang = lang
    locations = analyzeScriptFile(code, lang)
  }

  // locations means that this file has one or more vue components
  // but whether it is a component or not, we still need to collect it.
  if (options.stateAnalyze)
    collect(pureScriptCode, filename, codeLang, offsetContent, code)

  if (!locations || !locations.length)
    return null

  let ms = new MagicString(code)

  if (options.rerenderTrace)
    ms = analyzeByTraceRerender(ms, locations as InsertLocation[])

  return {
    code: ms.toString(),
    map: ms.generateMap(),
  }
}

export { getStateAnalyzeCollectedData } from './state-analyze'
