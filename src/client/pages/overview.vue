<script setup lang="ts">
import { version } from '../../../package.json'

const router = useRouter()
const isMacOS = navigator?.platform.toLowerCase().includes('mac')
function goIntro() {
  router.push('/')
}
</script>

<template>
  <div h-screen w-full flex class="n-panel-grids-center">
    <div flex="~ col gap2" ma h-full max-w-300 w-full p8 px20>
      <div flex-auto />

      <!-- Banner -->
      <div flex="~ col" mt-20 items-center>
        <div flex="~" mt--10 items-center justify-center>
          <Logo h-18 />
          <button mr--16 mt--6 @click="goIntro">
            <span
              mx-0.5 select-none whitespace-nowrap rounded bg-green-400:10 px-1.5 py-0.5 text-xs text-green-400
            >
              preview
            </span>
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
          <code>v3.2.0</code>
        </div>
        <a min-w-40 p4 theme-card-lime flex="~ col auto" href="/modules/pages">
          <div carbon-tree-view-alt text-3xl />
          <div>5 pages</div>
        </a>
        <a min-w-40 p4 theme-card-lime flex="~ col auto" href="/modules/components">
          <div i-carbon-assembly-cluster text-3xl />
          <div>20 components</div>
        </a>
      </div>
      <div flex="~ gap-6 wrap" mt-5 items-center justify-center>
        <a href="https://github.com/nuxt/devtools" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-blue" transition>
          <div i-carbon-star />
          Star on GitHub
        </a>
        <a href="https://github.com/nuxt/devtools/discussions/29" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-yellow" transition>
          <div i-carbon-data-enrichment />
          Ideas & Suggestions
        </a>
        <a href="https://github.com/nuxt/devtools/discussions/31" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-lime" transition>
          <div i-carbon-plan />
          Project Roadmap
        </a>
        <a href="https://github.com/nuxt/devtools/issues" target="_blank" flex="~ gap1" items-center op50 hover="op100 text-rose" transition>
          <div i-carbon-debug />
          Bug Reports
        </a>
        <a to="/settings" flex="~ gap1" inline-block items-center op50 hover:op80>
          <div i-carbon-settings />
          Settings
        </a>
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
  </div>
</template>
