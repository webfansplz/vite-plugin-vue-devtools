import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import sirv from 'sirv'
import Inspect from 'vite-plugin-inspect'
import VueInspector from 'vite-plugin-vue-inspector'
import { PLUGIN_NAME, createRPCServer } from '@vite-plugin-vue-devtools/core'
import type { AnalyzeOptions, DeepRequired } from '@vite-plugin-vue-devtools/core/compiler'
import { analyzeCode, analyzeOptionsDefault } from '@vite-plugin-vue-devtools/core/compiler'
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
   * Enable Vue DevTools to analyze the codebase by using Babel
   * @default
   * {
   *   rerenderTrace: true, // enable rerenderTrace feature
   * }
  */
  analyze?: Partial<AnalyzeOptions>

  /**
  * Customize openInEditor host (e.g. http://localhost:3000)
  * @default false
  */
  openInEditorHost?: string | false
}

const defaultOptions: DeepRequired<VitePluginVueDevToolsOptions> = {
  appendTo: '',
  analyze: analyzeOptionsDefault,
  openInEditorHost: false,
}

function mergeOptions(options: VitePluginVueDevToolsOptions): DeepRequired<VitePluginVueDevToolsOptions> {
  return Object.assign({}, defaultOptions, options)
}

function processAppendTo(id: string, code: string, appendTo: string | RegExp) {
  const [filename] = id.split('?', 2)
  if (appendTo
    && (
      (typeof appendTo === 'string' && filename.endsWith(appendTo))
      || (appendTo instanceof RegExp && appendTo.test(filename))))
    code = `${code}\nimport 'virtual:vue-devtools-path:app.js'`
  return code
}

export default function VitePluginVueDevTools(options?: VitePluginVueDevToolsOptions): PluginOption {
  const vueDevtoolsPath = getVueDevtoolsPath()
  const inspect = Inspect({
    silent: true,
  })

  const pluginOptions = mergeOptions(options ?? {})

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
      const { root, base } = config

      const projectPath = `${root}${base}`

      if (!id.startsWith(projectPath))
        return

      const { analyze, appendTo } = pluginOptions

      const analyzed = analyzeCode(code, id, analyze)

      if (!analyzed)
        return processAppendTo(id, code, appendTo)

      return {
        code: processAppendTo(id, analyzed.code, appendTo),
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
    VueInspector({
      toggleComboKey: '',
      toggleButtonVisibility: 'never',
      openInEditorHost: pluginOptions.openInEditorHost,
      ...(pluginOptions.appendTo ? { appendTo: pluginOptions.appendTo } : {}),
    }),
    plugin,
    inspect,
  ]
}
