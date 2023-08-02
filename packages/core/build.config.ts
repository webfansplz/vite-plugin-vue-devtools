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
    'esm-analyzer',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
