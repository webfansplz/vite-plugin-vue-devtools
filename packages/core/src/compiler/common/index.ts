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
  const { program, errors } = parse(code, options)
  return {
    ...program,
    errors,
  }
}

export function parseSFC(code: string, filename: string) {
  const sfc = sfcParse(code, {
    filename,
  })

  const { descriptor, errors } = sfc

  const scriptLang = descriptor.script?.lang || 'js'
  const scriptSetupLang = descriptor.scriptSetup?.lang || 'js'

  if (scriptLang !== scriptSetupLang)
    throw new Error(`[vue-devtools] ${filename} <script> and <script setup> must use the same language`)
  if (errors.length) {
    console.log(`[vue-devtools] parse ${filename} failed`, errors)
    throw new Error(`[vue-devtools] parse ${filename} failed`)
  }

  const lang = scriptLang || scriptSetupLang

  return {
    sfc,
    script: descriptor.script,
    scriptSetup: descriptor.scriptSetup,
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
}) {
  // @ts-expect-error estree-walker types are not compatible with babel types
  return walk(node, handlers)
}
