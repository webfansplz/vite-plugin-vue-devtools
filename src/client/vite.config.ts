import { join, resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'

export default defineConfig({
  base: '/__devtools__/',

  resolve: {
    alias: {
      '~/': __dirname,
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
    Pages({
      pagesDir: 'pages',
    }),
    Components({
      dirs: ['components', 'ui-kit'],
      dts: join(__dirname, 'components.d.ts'),
    }),
    Unocss(),
    AutoImport({
      dirs: [
        // './logic',
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
    outDir: resolve(__dirname, '../../dist/client'),
    minify: false, // 'esbuild',
    emptyOutDir: true,
  },
})
