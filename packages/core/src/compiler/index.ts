import MagicString from 'magic-string'
import type { InsertLocation } from './common'
import { analyzeScriptFile, analyzeVueSFC, isAcceptableLang, isVUE } from './common'
import { analyzeByTraceRerender } from './trace-rerender'

export interface AnalyzeOptions {
  /**
   * @default true
   */
  rerender: boolean
  /**
   * @default ['node_modules']
   */
  exclude: string[]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : Required<T[P]>;
}

export function analyzeCode(code: string, filename: string, options: AnalyzeOptions) {
  if (!isAcceptableLang(filename))
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

  if (options.rerender)
    ms = analyzeByTraceRerender(ms, location)

  return {
    code: ms.toString(),
    map: ms.generateMap(),
  }
}
