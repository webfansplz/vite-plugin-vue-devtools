import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/types',
  ],
  externals: [
    //
    'vue',
  ],
  declaration: true,
  rollup: {
    emitCJS: true,
  },
})
