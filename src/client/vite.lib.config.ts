import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { getBase } from 'vite-plugin-devtools'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: getBase('vite-plugin-vue-devtools'),

  resolve: {
    alias: {
      '~/': __dirname,
    },
  },
  plugins: [
    Vue(),
  ],
  optimizeDeps: {
    exclude: [
      'vite-hot-client',
    ],
  },
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, '../../dist/client'),
    lib: {
      formats: ['es'],
      name: 'onIframe',
      entry: {
        onIframe: resolve(__dirname, 'onIframe.ts'),
      },
    },
    /* minify: false, // 'esbuild',
    rollupOptions: {
      input: [resolve(__dirname, 'onIframe.ts')],
      output: {
        name: 'iframe',
        preserveModules: false
      }
    }, */
  },

})
