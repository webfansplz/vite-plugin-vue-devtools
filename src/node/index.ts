import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import sirv from 'sirv'
import Inspect from 'vite-plugin-inspect'
import { createRPCServer } from 'vite-dev-rpc'
import VueInspector from 'vite-plugin-vue-inspector'
import { DIR_CLIENT } from '../dir'
import type { RPCFunctions } from '../types'
import { getComponentsRelationships, getImageMeta, getStaticAssets, getTextAssetContent } from './rpc'

const NAME = 'vite-plugin-vue-devtools'

function getVueDevtoolsPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/\/src/node')
}

export default function PluginVueDevtools(): PluginOption {
  const vueDevtoolsPath = getVueDevtoolsPath()
  const inspect = Inspect({
    silent: true,
  })
  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    const base = (server.config.base) || '/'
    server.middlewares.use(`${base}__devtools`, sirv(DIR_CLIENT, {
      single: true,
      dev: true,
    }))

    createRPCServer<RPCFunctions>('vite-plugin-vue-devtools', server.ws, {
      componentGraph: () => getComponentsRelationships(inspect.api.rpc),
      inspectClientUrl: () => `${config.base || '/'}__inspect/`,
      staticAssets: () => getStaticAssets(config),
      getImageMeta,
      getTextAssetContent,
    })
  }
  const plugin = <PluginOption>{
    name: NAME,
    enforce: 'pre',
    apply: 'serve',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    configureServer(server) {
      configureServer(server)
    },
    async resolveId(importee: string) {
      if (importee.startsWith('virtual:vue-devtools-options')) {
        return importee
      }
      else if (importee.startsWith('virtual:vue-devtools-path:')) {
        const resolved = importee.replace('virtual:vue-devtools-path:', `${vueDevtoolsPath}/`)
        return resolved
      }
    },
    async load(id) {
      if (id === 'virtual:vue-devtools-options')
        return `export default ${JSON.stringify({ ...config })}`
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
  }

  return [
    plugin,
    inspect,
    VueInspector({
      toggleComboKey: '',
      toggleButtonVisibility: 'never',
    }),
  ]
}
