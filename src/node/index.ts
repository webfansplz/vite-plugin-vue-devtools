import type { Plugin, ViteDevServer } from 'vite'
import sirv from 'sirv'
import { DIR_CLIENT } from '../dir'

const NAME = 'vite-plugin-vue-devtools'

export default function PluginVueDevtools(): Plugin {
  function configureServer(server: ViteDevServer) {
    const base = (server.config.base) || '/'
    server.middlewares.use(`${base}__devtools`, sirv(DIR_CLIENT, {
      single: true,
      dev: true,
    }))
  }
  const plugin = <Plugin>{
    name: NAME,
    enforce: 'pre',
    apply: 'serve',
    // configResolved(config) {},
    configureServer(server) {
      configureServer(server)
      // console.log(server)
    },
    async buildEnd() {

    },
  }

  return plugin
}
