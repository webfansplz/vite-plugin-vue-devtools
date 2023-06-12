import { promises as fsp } from 'node:fs'
import { resolve } from 'pathe'

export async function getPackages(root: string) {
  // TODO: support monorepo workspace ?
  const pkgPath = resolve(root, 'package.json')
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'))
  const categorizedPackages = {}
  const packages = {}
  for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    if (!data[type])
      continue
    categorizedPackages[type] = data[type]
  }
  for (const type in categorizedPackages) {
    for (const name in categorizedPackages[type]) {
      const version = categorizedPackages[type][name]
      packages[name] = {}
      packages[name].version = version
      packages[name].type = type
    }
  }
  return {
    packages,
  }
}
