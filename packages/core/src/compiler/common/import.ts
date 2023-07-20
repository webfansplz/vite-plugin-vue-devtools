import type MS from 'magic-string'
import { entries } from './utils'

/**
 * @description
 * - import <{ a, b }> from 'c'
 * - import <* as d> from 'e'
 * - import <f> from 'g'
 * - import 'h'
 * will ignore import type
 */
const importRE = /import(?:[\s]+([\w*{}\n\r\t, ]+)[\s]+from)?[\s]+['"]([^'"]+)['"]/g

/**
 * @description
 * - {id
 * - { id }
 * - id }
 * - type a
 * - a as b
 * - { \nid\n}
 */
export const PURE_IMPORT_RE = /{?\s?([$A-Za-z_](\s?[$A-Za-z0-9_])+)\s?}?/

/**
 * @description
 * - `import { a as b } from 'c'`
 * - `import * as d from 'e'`
 */
export const IMPORT_ALIAS = /(.+)\sas\s(.+)/

interface AnalyzeImportAll { all: true; allAlias: string | null }
interface AnalyzeImportItem {
  raw: string
  alias: string | null
}
type AnalyzeImportResult = AnalyzeImportAll | AnalyzeImportItem[]

export function collectAllImports(code: string): Record<string, AnalyzeImportResult> {
  // k: source, v: imports
  const imports: Record<string, AnalyzeImportResult> = {}

  let match: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while (match = importRE.exec(code)) {
    const [, importsString, source] = match
    // figure out if it is import all
    const isAll = !importsString || importsString.startsWith('*')
    if (isAll) {
      const alias = IMPORT_ALIAS.exec(importsString)
      imports[source] = { all: true, allAlias: alias?.[1] || null }
      continue
    }
    const result = importsString.split(',').map((i) => {
      const [, raw] = PURE_IMPORT_RE.exec(i.trim()) || []
      // resolve import alias
      const r = IMPORT_ALIAS.exec(raw)
      return {
        raw: r ? r[1] : raw,
        alias: r ? r[2] : null,
      }
    }).filter(item => item.raw && !item.raw.startsWith('type ')) // <-- filter `import { type foo }` case
    if (!imports[source]) {
      imports[source] = result
      continue
    }
    if (Reflect.get(imports[source], 'isAll'))
      continue
    imports[source] = imports[source]
      ? [...(imports[source] as AnalyzeImportItem[]), ...result]
      : result
  }
  return imports
}

export function ensureImport(code: MS, importPackages: Record<string, { id: string; alias: string }[]>) {
  for (const [source, packages] of entries(importPackages)) {
    const prependCode = `import { ${packages.map(p => `${p.id} as ${p.alias}`).join(', ')} } from '${source}'`
    code.prepend(`${prependCode};\n`)
  }
  return code
}
