import type { SFCDescriptor, SFCParseResult } from '@vue/compiler-sfc'
import { parse as sfcParse } from '@vue/compiler-sfc'
import type { ParserOptions, ParserPlugin } from '@babel/parser'
import { parse } from '@babel/parser'
import { isJSX, isTS } from '.'

export interface InsertLocation {
  start: number
  end: number
}

export function getBabelParsePlugins(lang: string) {
  const plugins: ParserPlugin[] = []
  if (isTS(lang))
    plugins.push('typescript')
  if (isJSX(lang))
    plugins.push('jsx')
  return plugins
}

export function babelParse(code: string, lang: string) {
  const options: ParserOptions = {
    plugins: getBabelParsePlugins(lang),
    sourceType: 'module',
  }
  return parse(code, options)
}

export function parseSFC(code: string, filename: string): {
  sfc: SFCParseResult
  script: SFCDescriptor['script']
  scriptSetup: SFCDescriptor['scriptSetup']
  scriptLocation: InsertLocation
  scriptSetupLocation: InsertLocation
  getScriptAST(): ReturnType<typeof babelParse> | undefined
  getScriptSetupAST(): ReturnType<typeof babelParse> | undefined
  lang: string
} {
  const sfc = sfcParse(code, {
    filename,
  })

  const { descriptor } = sfc

  const scriptLang = descriptor.script?.lang
  const scriptSetupLang = descriptor.scriptSetup?.lang

  const lang = (scriptSetupLang ?? scriptLang) ?? 'js'

  return {
    sfc,
    script: descriptor.script,
    scriptSetup: descriptor.scriptSetup,
    scriptLocation: {
      start: descriptor.script?.loc.start.offset ?? 0,
      end: descriptor.script?.loc.end.offset ?? 0,
    },
    scriptSetupLocation: {
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
    lang,
  }
}
