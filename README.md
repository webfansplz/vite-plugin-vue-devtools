> [!IMPORTANT]
> We are heavily refactoring the codebase, so there might only be limited support and a slow response now. The new version will be released soon, if you have any suggestions, please feel free to [create an issue](https://github.com/webfansplz/vite-plugin-vue-devtools/issues/new).

<p align="center">
  <img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/bg.png" />
</p>
<h1 align="center">
Vue DevTools <sup>Preview</sup>
</h1>

<p align="center">
English | <a href="./README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-devtools" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-devtools" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-devtools" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-devtools" alt="NPM Downloads" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-devtools" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/node/v/vite-plugin-vue-devtools" alt="Node Compatibility" /></a>
 <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/webfansplz/vite-plugin-vue-devtools" alt="License" /></a>
</p>

<p align="center">
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/1">💡 Ideas & Suggestions</a> |
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/2">🗺️ Project Roadmap</a> |
  <a href="https://discord.gg/sHyy7gVPUG">🧑‍💻 Discord Channel</a> 
</p>

<p align="center">
<a href="https://stackblitz.com/edit/vitejs-vite-oxbwzk?file=vite.config.ts&view=preview"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>
</p>


## 📖 Introduction

`vite-plugin-vue-devtools` is a `Vite` plugin designed to enhance the `Vue` developer experience.



## 🎉 Features

### Pages

The pages tab shows your current routes and provide a quick way to navigate to them. For dynamic routes, it also provide a form to fill with each params interactively. You can also use the textbox to play and test how each route is matched.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/pages.png" />


### Components

Components tab show all the components you are using in your app and hierarchy. You can also select them to see the details of the component (e.g. data,props).

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/components.png" />

### Assets

Assets tab that shows all your static assets and their information. You can open the asset in the browser or download it.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/assets.png" />

### Timeline

Timeline tab has three categories: Performance, Router Navigations, and [Pinia](https://github.com/vuejs/pinia). You can switch between them to see the state changes and timelines.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/timeline.png" />

### Routes

Routes tab is a feature integrated with [Vue Router](https://github.com/vuejs/router), allowing you to view the registered routes and their details.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/routes.png" />

### Pinia

Pinia tab is a feature integrated with [Pinia](https://github.com/vuejs/pinia), allowing you to view the registered modules and their details.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/pinia.png" />

### Graph

Graph tab provides a graph view that show the relationship between components. 

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/graph.png" />

### Inspect

Inspect expose the [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) integration, allowing you to inspect transformation steps of [Vite](https://vitejs.dev/). It can be helpful to understand how each plugin is transforming your code and spot potential issues.

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/inspect.png" />

### Inspector

You can also use the "Inspector" feature to inspect the DOM tree and see which component is rendering it. Click to go to your editor of the specific line. Making it much easier to make changes, without the requirement of understanding the project structure thoroughly. (This feature is implemented based on the [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector))

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/inspector.png" height=450 />

## 📦 Installation

```

# vite-plugin-vue-devtools 

pnpm install vite-plugin-vue-devtools -D

```

## 🦄 Usage

### Configuration Vite

```ts
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    VueDevTools(),
    vue(),
  ],
})
```

### Options

```ts
interface AnalyzeOptions {
  /**
   * @default true
   */
  rerenderTrace: boolean
}

interface VitePluginVueDevToolsOptions {
  /**
   * append an import to the module id ending with `appendTo` instead of adding a script into body
   * useful for projects that do not use html file as an entry
   *
   * WARNING: only set this if you know exactly what it does.
   */
  appendTo?: string | RegExp
  /**
   * Enable Vue DevTools to analyze the codebase by using Babel
   * @default
   * {
   *   rerenderTrace: true, // enable rerenderTrace feature
   * }
   */
  analyze?: Partial<AnalyzeOptions>

  /**
   * Customize openInEditor host (e.g. http://localhost:3000)
   * @default false
   */
  openInEditorHost?: string | false
}
```

## 💡 Notice

- Only available in `development mode`.
- Only support `Vue3.0+` and `Vite 3.1+`.
- Only supports single-instance `Vue` applications.
- Doesn't support `SSR` (If you're using `Nuxt`, use [nuxt/devtools](https://github.com/nuxt/devtools) directly).
- The plugin follows `Vue's DevTools` configuration, so if you have configured the `hide` option, it will also be applied in this plugin. e.g.

  ```js
  // This Vue instance will be ignored by the plugin.
  createApp({
    render: () => h(App),
    devtools: {
      hide: true,
    },
  })
  ```

## 📖 Blog Post

- [Introducing Vue DevTools (Vite Plugin)](https://gist.github.com/webfansplz/bc90a773a0dd474a34e043ab2d2a37a4)

## 🌸 Credits

- This project is highly inspired by [nuxt/devtools](https://github.com/nuxt/devtools). Kudos to [Anthony Fu](https://github.com/antfu) and `Nuxt` team for the awesome work!

- [vuejs/devtools](https://github.com/vuejs/devtools)


## 👨‍💻 Contributors

<a href="https://github.com/webfansplz/vite-plugin-vue-devtools/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=webfansplz/vite-plugin-vue-devtools" />   
</a>    

## 📄 License

[MIT LICENSE](./LICENSE)

