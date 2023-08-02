import type { AcceptableLang } from 'esm-analyzer'
import { Project } from 'esm-analyzer'

const project = new Project('state-analyze')

export function collect(code: string, filename: string, lang: string) {
  project.addFile(filename, code, lang as AcceptableLang)
}

export async function prepareStateAnalyze() {
  await project.prepare()
}

export function getAnalyzeResultByPath(absolutePath: string) {
  return project.getAnalyzeResults(absolutePath)
}
