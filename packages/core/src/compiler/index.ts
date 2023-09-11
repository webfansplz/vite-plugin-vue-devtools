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
    return code

  let locations: InsertLocation[] | null = null

  if (isVUE(filename)) {
    const location = analyzeVueSFC(code, filename)
    if (location)
      locations = [location]
  }
  else {
    const lang = filename.split('.').pop()!
    locations = analyzeScriptFile(code, lang)
  }

  if (!locations || !locations.length)
    return code

  let ms = new MagicString(code)

  if (options.rerenderTrace)
    ms = analyzeByTraceRerender(ms, locations as InsertLocation[])

  return {
    code: ms.toString(),
    get map() {
      return ms.generateMap({
        source: filename,
        includeContent: true,
        hires: 'boundary',
      })
    },
  }
}
