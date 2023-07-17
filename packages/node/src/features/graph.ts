import type { ViteInspectAPI } from 'vite-plugin-inspect'

export async function getComponentsRelationships(rpc: ViteInspectAPI['rpc']): Promise<ModuleInfo[]> {
  const list = await rpc.list()
  const modules = list?.modules || []

  return modules
}
