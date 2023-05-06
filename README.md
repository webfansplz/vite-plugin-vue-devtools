<h1>
Vue DevTools <sup>Preview</sup>
</h1>

## 📖 Introduction

`vite-plugin-vue-devtools` is a Vite plugin designed to enhance the Vue developer experience.

<!-- <p>
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/1">💡 Ideas & Suggestions</a> |
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/2">🗺️ Project Roadmap</a> |
</p> -->


## 📦 Installation

```

# vite-plugin-vue-devtools 

pnpm install vite-plugin-vue-devtools -D

```

## 🦄 Usage

### Configuration Vite

```ts
import { defineConfig } from 'vite'
import VueDevtools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    VueDevtools(),
    vue(),
  ],
})
```

## 💡 Notice

- Only available in development mode.
- Only support Vue3.0+.
- Doesn't support SSR (If you're using Nuxt, use [nuxt/devtools](https://github.com/nuxt/devtools) directly).

## 🌸 Credits

- This project is highly inspired by [nuxt/devtools](https://github.com/nuxt/devtools).

## 📄 License

[MIT LICENSE](./LICENSE)

