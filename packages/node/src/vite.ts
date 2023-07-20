import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import sirv from 'sirv'
import Inspect from 'vite-plugin-inspect'
import VueInspector from 'vite-plugin-vue-inspector'
import { PLUGIN_NAME, analyzeCode, createRPCServer } from '@vite-plugin-vue-devtools/core'
import type { AnalyzeOptions, DeepRequired } from '@vite-plugin-vue-devtools/core'
import { DIR_CLIENT } from './dir'
import {
  execNpmScript,
  getComponentInfo,
  getComponentsRelationships,
  getImageMeta,
  getPackages,
  getStaticAssets,
  getTextAssetContent,
  getVueSFCList,
} from './features'

function getVueDevtoolsPath() {
  const pluginPath = normalizePath(path.dirname(fileURLToPath(import.meta.url)))
  return pluginPath.replace(/\/dist$/, '/\/src')
}

export interface VitePluginVueDevToolsOptions {
  /**
  * append an import to the module id ending with `appendTo` instead of adding a script into body
  * useful for projects that do not use html file as an entry
  *
  * WARNING: only set this if you know exactly what it does.
  * @default ''
  */
  appendTo?: string | RegExp
  /**
   * Enable rerender trace feature
   * @default true
  */
  analyze?: Partial<AnalyzeOptions>
}

const defaultOptions: DeepRequired<VitePluginVueDevToolsOptions> = {
  appendTo: '',
  analyze: {
    rerender: true,
  },
}

function mergeOptions(options: VitePluginVueDevToolsOptions): DeepRequired<VitePluginVueDevToolsOptions> {
  return Object.assign({}, defaultOptions, options)
}

export default function VitePluginVueDevTools(options: VitePluginVueDevToolsOptions): PluginOption {
  const vueDevtoolsPath = getVueDevtoolsPath()
  const inspect = Inspect({
    silent: true,
  })

  const pluginOptions = mergeOptions(options)

  let config: ResolvedConfig

  function configureServer(server: ViteDevServer) {
    const base = (server.config.base) || '/'
    server.middlewares.use(`${base}__devtools__`, sirv(DIR_CLIENT, {
      single: true,
      dev: true,
    }))

    const rpc = createRPCServer<RPCFunctions>(server.ws, {
      root: () => config.root,
      inspectClientUrl: () => `${config.base || '/'}__inspect/`,
      componentGraph: () => getComponentsRelationships(inspect.api.rpc),
      staticAssets: () => getStaticAssets(config),
      getImageMeta,
      getTextAssetContent,
      getPackages: () => getPackages(config.root),
      getVueSFCList: () => getVueSFCList(config.root),
      getComponentInfo: (filename: string) => getComponentInfo(config.root, filename),
      installPackage: (packages: string[], options: ExecNpmScriptOptions = {}) => execNpmScript(packages, {
        ...options,
        type: 'install',
        cwd: config.root,
        callback: (type: string, data: string) => {
          if (type === 'data')
            rpc.onTerminalData({ data })

          else if (type === 'exit')
            rpc.onTerminalExit({ data })
        },
      }),
      uninstallPackage: (packages: string[], options: ExecNpmScriptOptions = {}) => execNpmScript(packages, {
        ...options,
        type: 'uninstall',
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
    name: PLUGIN_NAME,
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
      const { analyze, appendTo } = pluginOptions

      const [filename] = id.split('?', 2)
      if (appendTo
        && (
          (typeof appendTo === 'string' && filename.endsWith(appendTo))
          || (appendTo instanceof RegExp && appendTo.test(filename))))
        code = `${code}\nimport 'virtual:vue-devtools-path:app.js'`

      if (analyze) {
        const transformedCode = analyzeCode(code, id, analyze)
        if (!transformedCode)
          return
        return {
          code: transformedCode.code,
          map: transformedCode.map,
        }
      }
    },
    transformIndexHtml(html) {
      if (pluginOptions.appendTo)
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
