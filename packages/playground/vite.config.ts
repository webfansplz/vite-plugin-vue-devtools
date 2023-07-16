import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Custom aliasuntil Jiti issue is resolved
      // https://github.com/unjs/jiti/issues/136
      '@vite-plugin-vue-devtools/core': resolve(__dirname, '../core/src/index'),
    },
  },
  plugins: [
    VueDevTools(),
    vue(),
  ],
})
