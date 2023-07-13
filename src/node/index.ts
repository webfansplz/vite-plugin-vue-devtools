import type { PluginOption, ResolvedConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import createDevtools from 'vite-plugin-devtools/dist/server'
import VueInspector from 'vite-plugin-vue-inspector'
import type { ServerFunctions } from 'vite-plugin-devtools/dist/server'
import { DIR_CLIENT, ICON, IFRAME_HOOK } from '../dir'
import type { ExecNpmScriptOptions } from '../types'
import { execNpmScript, getComponentInfo, getComponentsRelationships, getImageMeta, getPackages, getStaticAssets, getTextAssetContent, getVueSFCList } from './rpc'

const NAME = 'vite-plugin-vue-devtools'

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
  const inspect = Inspect({
    silent: true,
  })
  let config: ResolvedConfig

  const { plugin, addServerFunction, serverRPC } = createDevtools(NAME, {
    clientDir: DIR_CLIENT,
    icon: ICON,
    onIframe: IFRAME_HOOK,
    inspector: true
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
    root: () => config.root,
  }

  for (const name in rpcFunctions)
    addServerFunction(name as keyof typeof rpcFunctions, rpcFunctions[name])

  return [inspect, {
    ...plugin,
    configureServer(server) {
      config = server.config
      return plugin?.configureServer(server as any)
    },
  },
    VueInspector({
      toggleComboKey: '',
      toggleButtonVisibility: 'never',
    }),
  ]
}
