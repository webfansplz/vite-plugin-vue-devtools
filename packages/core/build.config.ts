import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  externals: [
    'vue',
    'ast-kit',
    '@vue/compiler-sfc',
    '@babel/parser',
    '@babel/type',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
    cjsBridge: true,
  },
})
