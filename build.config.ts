import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/node/index',
  ],
  clean: false,
  declaration: true,
  externals: [
    'vite',
    'vite-plugin-inspect',
    'vite-plugin-vue-inspector',
    'vite-plugin-devtools',
    'execa',
    '@webfansplz/vuedoc-parser',
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})
