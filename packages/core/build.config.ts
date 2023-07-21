import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/compiler',
  ],
  externals: [
    'vue',
    '@vue/compiler-sfc',
    '@babel/parser',
    'estree-walker',
    'magic-string',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
