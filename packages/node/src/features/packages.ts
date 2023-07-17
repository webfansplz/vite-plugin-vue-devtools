import { promises as fsp } from 'node:fs'
import { resolve } from 'pathe'

export async function getPackages(root: string) {
  const pkgPath = resolve(root, 'package.json')
  const data = JSON.parse(await fsp.readFile(pkgPath, 'utf-8').catch(() => '{}'))
  const packages = {}

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
  } as unknown as Record<string, Omit<PackageMeta, 'name'>>
}
