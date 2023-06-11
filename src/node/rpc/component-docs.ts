import path from 'node:path'
import fg from 'fast-glob'

export async function getVueSFCList(root: string) {
  const files = await fg([
    '**/*.vue',
  ], {
    cwd: root,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/dist/**'],
  })
  return files
}

export async function getComponentInfo(root: string, filename: string) {
  const { parseComponent } = await import('@webfansplz/vuedoc-parser')
  return await parseComponent({
    filename: path.resolve(root, filename),
  })
}
