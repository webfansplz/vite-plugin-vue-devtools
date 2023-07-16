import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import VueJSX from '@vitejs/plugin-vue-jsx'
import { ComponentsResolver as DevToolsUiKitResolver } from '@vite-plugin-vue-devtools/ui-kit'

export default defineConfig({
  base: './',

  resolve: {
    alias: {
      '~/': `${resolve(__dirname)}/`,
      '@vite-plugin-vue-devtools/core': resolve(__dirname, '../core/src/index'),
    },
  },

  plugins: [
    {
      name: 'local-object-transform',
      transform: {
        order: 'post',
        async handler(code) {
          return `${code}\n/* Injected with object hook! */`
        },
      },
    },
    Vue(),
    VueJSX(),
    Pages({
      pagesDir: 'pages',
    }),
    Components({
      dirs: ['components', 'ui-kit'],
      dts: join(__dirname, 'components.d.ts'),
      resolvers: [DevToolsUiKitResolver({ prefix: 'N' })],
    }),
    Unocss(),
    AutoImport({
      dirs: [
        './utils',
        './composables',
      ],
      dts: join(__dirname, 'auto-imports.d.ts'),
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
    }),
  ],

  optimizeDeps: {
    exclude: [
      'vite-hot-client',
    ],
  },

  build: {
    target: 'esnext',
    outDir: resolve(__dirname, '../node/dist/client'),
    minify: false, // 'esbuild',
    emptyOutDir: true,
  },
})
