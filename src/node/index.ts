import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import sirv from 'sirv'
import Inspect from 'vite-plugin-inspect'
import VueInspector from 'vite-plugin-vue-inspector'
import { createRPCServer } from '../vite-dev-rpc'
import { DIR_CLIENT } from '../dir'
import type { InstallPackageOptions, RPCFunctions } from '../types'
import { getComponentInfo, getComponentsRelationships, getImageMeta, getPackages, getStaticAssets, getTextAssetContent, getVueSFCList, installPackage } from './rpc'

const NAME = 'vite-plugin-vue-devtools'

function getVueDevtoolsPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/\/src/node')
}

export interface VitePluginVueDevToolsOptions {
  /**
  * append an import to the module id ending with `appendTo` instead of adding a script into body
  * useful for projects that do not use html file as an entry
  *
  * WARNING: only set this if you know exactly what it does.
  */
  appendTo?: string | RegExp
}

export default function VitePluginVueDevTools(options: VitePluginVueDevToolsOptions = { appendTo: '' }): PluginOption {
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

    const rpc = createRPCServer<RPCFunctions>('vite-plugin-vue-devtools', server.ws, {
      componentGraph: () => getComponentsRelationships(inspect.api.rpc),
      inspectClientUrl: () => `${config.base || '/'}__inspect/`,
      staticAssets: () => getStaticAssets(config),
      getImageMeta,
      getTextAssetContent,
      getPackages: () => getPackages(config.root),
      getVueSFCList: () => getVueSFCList(config.root),
      getComponentInfo: (filename: string) => getComponentInfo(config.root, filename),
      installPackage: (packages: string[], options: InstallPackageOptions = {}) => installPackage(packages, {
        ...options,
        cwd: config.root,
        callback: (type: string, data: string) => {
          if (type === 'data')
            rpc.onTerminalData({ data })

          else if (type === 'exit')
            rpc.onTerminalExit({ data })
        },
      }),
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
        return `export default ${JSON.stringify({ base: config.base })}`
    },
    transform(code, id) {
      const { appendTo } = options

      if (!appendTo)
        return

      const [filename] = id.split('?', 2)
      if ((typeof appendTo === 'string' && filename.endsWith(appendTo))
        || (appendTo instanceof RegExp && appendTo.test(filename)))
        return { code: `${code}\nimport 'virtual:vue-devtools-path:app.js'` }
    },
    transformIndexHtml(html) {
      if (options.appendTo)
        return

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
