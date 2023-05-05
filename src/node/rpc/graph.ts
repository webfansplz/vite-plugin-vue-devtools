import type { ViteInspectAPI } from 'vite-plugin-inspect'

export async function getComponentsRelationships(rpc: ViteInspectAPI['rpc']) {
  const list = await rpc.list()
  const modules = list?.modules || []

  return modules
  const vueModules = modules.filter(i => i.id.match(/\.vue($|\?v=)/))

  const graph = vueModules.map((i) => {
    function searchForVueDeps(id: string, seen = new Set<string>()): string[] {
      if (seen.has(id))
        return []
      seen.add(id)
      const module = modules.find(m => m.id === id)
      if (!module)
        return []
      return module.deps.flatMap((i) => {
        if (vueModules.find(m => m.id === i))
          return [i]
        return searchForVueDeps(i, seen)
      })
    }

    return {
      id: i.id,
      deps: searchForVueDeps(i.id),
    }
  })

  return graph
}
