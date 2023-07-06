import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { normalizePath } from 'vite'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import Inspect from 'vite-plugin-inspect'
import createDevtools from 'vite-plugin-devtools/dist/server'
import type { ServerFunctions } from 'vite-plugin-devtools/dist/server'

// import { createRPCServer } from '../vite-dev-rpc'
import { DIR_CLIENT, ICON, IFRAME_HOOK } from '../dir'
import type { ExecNpmScriptOptions } from '../types'
import { execNpmScript, getComponentInfo, getComponentsRelationships, getImageMeta, getPackages, getStaticAssets, getTextAssetContent, getVueSFCList } from './rpc'

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
  // const vueDevtoolsPath = getVueDevtoolsPath()
  const inspect = Inspect({
    silent: true,
  })
  let config: ResolvedConfig

  const { plugin, addServerFunction, serverRPC } = createDevtools(NAME, {
    clientDir: DIR_CLIENT,
    icon: ICON,
    onIframe: IFRAME_HOOK,
  })

  const rpcFunctions: ServerFunctions = {
    componentGraph: () => getComponentsRelationships(inspect.api.rpc),
    inspectClientUrl: () => `${config.base || '/'}__inspect/`,
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
          serverRPC.onTerminalData({ data })

        else if (type === 'exit')
          serverRPC.onTerminalExit({ data })
      },
    }),
    uninstallPackage: (packages: string[], options: ExecNpmScriptOptions = {}) => execNpmScript(packages, {
      ...options,
      type: 'uninstall',
      cwd: config.root,
      callback: (type: string, data: string) => {
        if (type === 'data')
          serverRPC.onTerminalData({ data })

        else if (type === 'exit')
          serverRPC.onTerminalExit({ data })
      },
    }),
  }

  for (const name in rpcFunctions)
    addServerFunction(name as keyof typeof rpcFunctions, rpcFunctions[name])

  return [inspect, {
    ...plugin,
    configureServer(server) {
      config = server.config
      return plugin?.configureServer(server)
    },
  }]

  function configureServer(server: ViteDevServer) {
    /* const base = (server.config.base) || '/'
    server.middlewares.use(`${base}__devtools__`, sirv(DIR_CLIENT, {
      single: true,
      dev: true,
    })) */

  }

  /* const plugin2 = <PluginOption>{
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
  } */

  /* return [
    plugin2,
    inspect,
    VueInspector({
      toggleComboKey: '',
      toggleButtonVisibility: 'never',
    }),
  ] */
}
