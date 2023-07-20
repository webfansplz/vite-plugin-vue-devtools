import type { SFCDescriptor, SFCParseResult } from '@vue/compiler-sfc'
import { parse as sfcParse } from '@vue/compiler-sfc'
import type { ParserOptions, ParserPlugin } from '@babel/parser'
import { parse } from '@babel/parser'
import type { Node } from '@babel/types'
import { walk } from 'estree-walker'
import type { WalkerContext } from 'estree-walker/types/walker'
import { isJSX, isTS } from './lang'

export * from './lang'
export * from './import'

export function getBabelParsePlugins(lang: string) {
  const plugins: ParserPlugin[] = []
  if (isTS(lang))
    plugins.push('typescript')
  if (isJSX(lang))
    plugins.push('jsx')
  return plugins
}

function babelParse(code: string, lang: string) {
  const options: ParserOptions = {
    plugins: getBabelParsePlugins(lang),
  }
  return parse(code, options)
}

export interface ScriptOffset {
  start: number
  end: number
}

export function parseSFC(code: string, filename: string): {
  sfc: SFCParseResult
  script: SFCDescriptor['script']
  scriptSetup: SFCDescriptor['scriptSetup']
  scriptOffset: ScriptOffset
  scriptSetupOffset: ScriptOffset
  getScriptAST(): ReturnType<typeof babelParse> | undefined
  getScriptSetupAST(): ReturnType<typeof babelParse> | undefined
} {
  const sfc = sfcParse(code, {
    filename,
  })

  const { descriptor } = sfc

  const scriptLang = descriptor.script?.lang ?? 'js'
  const scriptSetupLang = descriptor.scriptSetup?.lang ?? 'js'

  if (descriptor.script && descriptor.scriptSetup && (scriptLang !== scriptSetupLang))
    throw new Error(`[vue-devtools] ${filename} <script> and <script setup> must use the same language`)

  const lang = scriptLang || scriptSetupLang

  return {
    sfc,
    script: descriptor.script,
    scriptSetup: descriptor.scriptSetup,
    scriptOffset: {
      start: descriptor.script?.loc.start.offset ?? 0,
      end: descriptor.script?.loc.end.offset ?? 0,
    },
    scriptSetupOffset: {
      start: descriptor.scriptSetup?.loc.start.offset ?? 0,
      end: descriptor.scriptSetup?.loc.end.offset ?? 0,
    },
    getScriptAST() {
      if (!descriptor.script)
        return
      return babelParse(descriptor.script.content, lang)
    },
    getScriptSetupAST() {
      if (!descriptor.scriptSetup)
        return
      return babelParse(descriptor.scriptSetup.content, lang)
    },
  }
}

export type WalkCallback = (this: WalkerContext, node: Node, parent: Node | null, key: string | number | symbol | null | undefined, index: number | null | undefined) => void

export function walkAST(node: Node, handlers: {
  enter?: WalkCallback
  leave?: WalkCallback
}): Node | null {
  // @ts-expect-error estree-walker types are not compatible with babel types
  return walk(node, handlers)
}
