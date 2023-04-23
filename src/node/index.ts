import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import sirv from 'sirv'
import Inspect from 'vite-plugin-inspect'
import { createRPCServer } from 'vite-dev-rpc'
import type { ViteInspectAPI } from 'vite-plugin-inspect'
import { DIR_CLIENT } from '../dir'
import type { RPCFunctions } from '../types'

const NAME = 'vite-plugin-vue-devtools'

function getVueDevtoolsPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/\/src')
}

async function getComponentsRelationships(rpc: ViteInspectAPI['rpc']) {
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

export default function PluginVueDevtools(): Plugin[] {
  const vueDevtoolsPath = getVueDevtoolsPath()
  const inspect = Inspect()

  function configureServer(server: ViteDevServer) {
    const base = (server.config.base) || '/'
    server.middlewares.use(`${base}__devtools`, sirv(DIR_CLIENT, {
      single: true,
      dev: true,
    }))

    createRPCServer<RPCFunctions>('vite-plugin-vue-devtools', server.ws, {
      componentGraph: () => getComponentsRelationships(inspect.api.rpc),
    })
  }
  const plugin = <Plugin>{
    name: NAME,
    enforce: 'post',
    apply: 'serve',
    // configResolved(config) {},
    configureServer(server) {
      configureServer(server)
      // console.log(server)
    },
    async resolveId(importee: string) {
      if (importee.startsWith('virtual:vue-devtools-path:')) {
        const resolved = importee.replace('virtual:vue-devtools-path:', `${vueDevtoolsPath}/`)
        return resolved
      }
    },
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            injectTo: 'head',
            attrs: {
              type: 'module',
              src: '/@id/virtual:vue-devtools-path:app.js',
            },
          },
        ],
      }
    },
    async buildEnd() {
    },
    plugin: [
      inspect,
    ],
  }

  return [inspect, plugin]
}
