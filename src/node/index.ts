import type { Plugin } from 'vite'

const NAME = 'vite-plugin-vue-devtools'

export default function PluginVueDevtools(): Plugin {
  const plugin = <Plugin>{
    name: NAME,
    enforce: 'pre',
    apply: 'serve',
    // configResolved(config) {},
    configureServer(server) {
      // console.log(server)
    },
    async buildEnd() {

    },
  }

  return plugin
}
