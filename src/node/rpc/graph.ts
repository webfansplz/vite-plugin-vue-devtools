import type { ViteInspectAPI } from 'vite-plugin-inspect'
import type { ModuleInfo } from '../../types'

export async function getComponentsRelationships(rpc: ViteInspectAPI['rpc']): Promise<ModuleInfo[]> {
  console.log('here')
  const list = await rpc.list()
  const modules = list?.modules || []
  console.log('here 2')

  return modules
}
