<script setup lang="ts">
import { vueVersion } from '../logic/app'
import { version } from '../../../package.json'
import { componentCount, pageCount } from '../logic/overview'

const isMacOS = navigator?.platform.toLowerCase().includes('mac')
</script>

<template>
  <VPanelGrids h-screen w-full flex>
    <div flex="~ col gap2" ma h-full max-w-300 w-full p8 px20>
      <div flex-auto />

      <!-- Banner -->
      <div flex="~ col" mt-20 items-center>
        <div flex="~" mt--10 items-center justify-center>
          <Logo h-18 />
          <button mr--16 mt--6>
            <VBadge
              bg-green-400:10 text-green-400
              title="preview"
              v-text="'preview'"
            />
          </button>
        </div>
        <div mb6 mt--1 text-center text-sm flex="~ gap-1">
          <span op40>
            Vue DevTools
          </span>
          <code op40>v{{ version }}</code>
        </div>
      </div>
      <!-- Main Grid -->
      <div flex="~ gap2 wrap">
        <div p4 theme-card-green flex="~ col auto">
          <div logos-vue text-3xl />
          <code>v{{ vueVersion }}</code>
        </div>
        <RouterLink flex="~ col auto" to="/pages" replace min-w-40 p4 theme-card-lime>
          <div carbon-tree-view-alt text-3xl />
          <div>{{ pageCount }} pages</div>
        </RouterLink>
        <RouterLink flex="~ col auto" to="/components" replace min-w-40 p4 theme-card-lime>
          <div i-carbon-assembly-cluster text-3xl />
          <div>{{ componentCount }} components</div>
        </RouterLink>
      </div>
      <div flex="~ gap-6 wrap" mt-5 items-center justify-center>
        <a href="https://github.com/webfansplz/vite-plugin-vue-devtools" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-blue" transition>
          <div i-carbon-star />
          Star on GitHub
        </a>
        <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/1" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-yellow" transition>
          <div i-carbon-data-enrichment />
          Ideas & Suggestions
        </a>
        <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/discussions/2" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-lime" transition>
          <div i-carbon-plan />
          Project Roadmap
        </a>
        <a href="https://github.com/webfansplz/vite-plugin-vue-devtools/issues" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-rose" transition>
          <div i-carbon-debug />
          Bug Reports
        </a>
        <RouterLink to="/settings" flex="~ gap1" replace inline-block items-center op50 hover:op80>
          <div i-carbon-settings />
          Settings
        </RouterLink>
      </div>
      <div flex-auto />
      <div flex="~ gap-1" items-center justify-center text-sm op40>
        Press
        <template v-if="isMacOS">
          <VButton n="xs" class="px2">
            ⇧ Shift
          </VButton>
          <span>+</span>
          <VButton n="xs" class="px2">
            ⌥ Option
          </VButton>
          <span>+</span>
          <VButton n="xs" class="px2">
            D
          </VButton>
        </template>
        <template v-else>
          <VButton n="xs" class="px2">
            Shift
          </VButton>
          <span>+</span>
          <VButton n="xs" class="px2">
            Alt
          </VButton>
          <span>+</span>
          <VButton n="xs" class="px2">
            D
          </VButton>
        </template>
        to toggle DevTools
      </div>
    </div>
  </VPanelGrids>
</template>
