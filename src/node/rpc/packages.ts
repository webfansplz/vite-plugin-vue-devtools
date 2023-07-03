import { promises as fsp } from 'node:fs'
import { resolve } from 'pathe'
import type { PackageMeta } from '../../types'

export async function getPackages(root: string) {
  // TODO: support monorepo workspace ?
  const pkgPath = resolve(root, 'package.json')
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'))
  const packages: Record<string, Omit<PackageMeta, 'name'>> = {}

  for (const type of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const dep = data[type]
    if (!dep)
      continue
    for (const depName in dep) {
      packages[depName] = {
        version: dep[depName],
        type,
      }
    }
  }

  return {
    packages,
  }
}
