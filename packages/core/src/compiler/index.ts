import MagicString from 'magic-string'
import { analyzeVueSFC, isVUE } from './common'
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
  [P in keyof T]-?: T[P] extends {} ? DeepRequired<T[P]> : Required<T[P]>;
}

// TODO: support more, currently only analyze <script setup>
export function analyzeCode(code: string, filename: string, options: AnalyzeOptions) {
  if (!isVUE(filename))
    return null

  const offset = analyzeVueSFC(code, filename)
  if (!offset)
    return null

  let ms = new MagicString(code)

  if (options.rerender)
    ms = analyzeByTraceRerender(ms, offset)

  return {
    code: ms.toString(),
    map: ms.generateMap(),
  }
}
