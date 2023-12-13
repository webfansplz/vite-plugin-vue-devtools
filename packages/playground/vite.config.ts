import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Custom alias until Jiti issue is resolved
      // https://github.com/unjs/jiti/issues/136
      '@vite-plugin-vue-devtools/core/compiler': resolve(__dirname, '../core/src/compiler/index'),
      '@vite-plugin-vue-devtools/core': resolve(__dirname, '../core/src/index'),
    },
  },
  plugins: [
    VueDevTools() as Plugin[],
    vue(),
    jsx(),
  ],
})
