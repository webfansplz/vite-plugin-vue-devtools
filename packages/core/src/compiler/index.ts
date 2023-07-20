import MagicString from 'magic-string'
import { isVUE, parseSFC } from './common'
import { analyzeByTraceRerender } from './trace-rerender'

export interface AnalyzeOptions {
  /**
   * @default false
   */
  rerender: boolean
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends {} ? DeepRequired<T[P]> : Required<T[P]>;
}

// TODO: support more, currently only analyze <script setup>
export function analyzeCode(code: string, filename: string, options: AnalyzeOptions) {
  if (isVUE(filename))
    return null

  const { scriptSetup } = parseSFC(code, filename)

  if (!scriptSetup)
    return null

  let ms = new MagicString(code)

  if (options.rerender)
    ms = analyzeByTraceRerender(ms)

  return {
    code: ms.toString(),
    map: ms.generateMap(),
  }
}
