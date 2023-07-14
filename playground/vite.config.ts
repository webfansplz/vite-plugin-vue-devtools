import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevtools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    fs: {
      strict: false,
    },
  },
  plugins: [
    VueDevtools(),
    vue(),
  ],
})
