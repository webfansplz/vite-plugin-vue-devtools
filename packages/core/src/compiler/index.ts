import MagicString from 'magic-string'
import type { InsertLocation } from './common'
import { analyzeScriptFile, analyzeVueSFC, isAcceptableLang, isVUE } from './common'
import { analyzeByTraceRerender } from './trace-rerender'
import { entries } from './common/utils'

export interface AnalyzeOptions {
  /**
   * @default true
   */
  rerenderTrace: boolean
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
}

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

  let location: InsertLocation | null = null

  if (isVUE(filename)) {
    location = analyzeVueSFC(code, filename)
  }
  else {
    const lang = filename.split('.').pop()!
    location = analyzeScriptFile(code, lang)
  }

  if (!location)
    return null

  let ms = new MagicString(code)

  if (options.rerenderTrace)
    ms = analyzeByTraceRerender(ms, location)

  return {
    code: ms.toString(),
    map: ms.generateMap(),
  }
}
