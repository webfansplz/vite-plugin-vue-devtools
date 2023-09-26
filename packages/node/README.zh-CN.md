<p align="center">
  <img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/bg.png" />
</p>
<h1 align="center">
Vue DevTools <sup>预览</sup>
</h1>

<p align="center">
<a href="./README.md">English</a> | 简体中文
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-vue-devtools" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/vite-plugin-vue-devtools" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-vue-devtools" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/vite-plugin-vue-devtools" alt="NPM Downloads" /></a>
 <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/webfansplz/vite-plugin-vue-devtools" alt="License" /></a>
</p>

<p align="center">
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/1">💡 想法 & 建议</a> |
  <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/2">🗺️ 项目路线图</a> |
  <a href="https://discord.gg/sHyy7gVPUG">🧑‍💻 Discord 频道</a> 
</p>

<p align="center">
<a href="https://stackblitz.com/edit/vitejs-vite-oxbwzk?file=vite.config.ts&view=preview"><img src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" alt=""></a>
</p>


## 📖 介绍

`vite-plugin-vue-devtools` 是一个旨在增强 `Vue` 开发者体验的 `Vite` 插件。



## 🎉 特性

### Pages

`Pages` 选项卡显示您当前的页面路由并提供快速导航的方法。对于动态路由，它还提供了一个表单来交互式地填写每个参数。您还可以使用文本框来测试每个路由的匹配情况。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/pages.png" />


### Components

`Components` 选项卡显示您应用程序的所有组件树，您还可以选择它们来查看组件的详细信息（例如数据、属性）。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/components.png" />

### Assets

`Assets` 选项卡显示所有静态资源及其信息，您可以在浏览器中打开或下载它。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/assets.png" />

### Timeline

`Timeline` 选项卡包含三个类别：性能、路由导航和 [Pinia](https://github.com/vuejs/pinia)，您可以在它们之间切换以查看状态变化和时间线。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/timeline.png" />

### Routes

`Routes` 选项卡是与 [Vue Router](https://github.com/vuejs/router) 集成的功能，允许您查看注册的路由及其详细信息。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/routes.png" />

### Pinia

`Pinia` 选项卡是与 [Pinia](https://github.com/vuejs/pinia) 集成的功能，允许您查看注册的模块及其详细信息。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/pinia.png" />

### Graph

`Graph` 选项卡提供了显示组件依赖关系的视图。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/graph.png" />

### Inspect

`Inspect` 公开 [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) 集成，允许您检查 [Vite](https://vitejs.dev/) 的转换步骤，了解每个插件如何改变您的代码并发现潜在问题可能会有所帮助。

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/inspect.png" />

### Inspector

您还可以使用 `Inspector` 功能来检查 `DOM` 树并查看哪个组件正在渲染它，单击可转到编辑器的特定行，使更改变得更加容易，而无需彻底了解项目结构。 (该功能基于 [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector))

<img src="https://github.com/webfansplz/vite-plugin-vue-devtools/raw/main/screenshots/inspector.png" height=450 />

## 📦 安装

```

# vite-plugin-vue-devtools 

pnpm install vite-plugin-vue-devtools -D

```

## 🦄 示例

### Vite 配置

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

### 选项

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
}
```

## 💡 注意

- 仅在 `开发模式` 下可用。
- 仅支持 `Vue3.0+` 和 `Vite 3.1+`。
- 仅支持单实例 `Vue` 应用程序。
- 不支持 `SSR` （如果您使用 `Nuxt` ，请使用 [nuxt/devtools](https://github.com/nuxt/devtools)）。
- 该插件遵循 `Vue` 的 `DevTools` 配置，因此如果您配置了 `hide` 选项，它也将应用于该插件。例如

  ```js
  // This Vue instance will be ignored by the plugin.
  createApp({
    render: () => h(App),
    devtools: {
      hide: true,
    },
  })
  ```

## 📖 博客

- [介绍 Vue DevTools (Vite 插件)](https://gist.github.com/webfansplz/bc90a773a0dd474a34e043ab2d2a37a4)

## 🌸 致谢

- 该项目深受 [nuxt/devtools](https://github.com/nuxt/devtools) 的启发，感谢 [Anthony Fu](https://github.com/antfu) 和 `Nuxt` 团队的出色工作

- [vuejs/devtools](https://github.com/vuejs/devtools)


## 👨‍💻 贡献者

<a href="https://github.com/webfansplz/vite-plugin-vue-devtools/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=webfansplz/vite-plugin-vue-devtools" />   
</a>    

## 📄 License

[MIT LICENSE](./LICENSE)

