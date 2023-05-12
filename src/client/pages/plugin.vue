<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()


const h = ref('200px')

const resizeObserver = new ResizeObserver(entries => {
  entries.forEach(item => {
    h.value = item.target.offsetHeight - 150 + 'px'
  })
})

resizeObserver.observe(window.parent.document.querySelector('.vue-devtools-panel') as HTMLElement)


interface PluginInfoWithMetic {
  src: string
  mode?: 'client' | 'server' | 'all'
  ssr?: boolean
  metric?: PluginMetric
}

interface PluginMetric {
  src: string
  start: number
  end: number
  duration: number
}

function test(s = false): any {
  const temp: any[] = []
  const number = 10
  if (!s) {
    for (let i = 0; i < number; i++) {
      temp.push({
        src: `vue/dist/pages/runtime/plugins/router.js${i}vite`,
        start: i,
        end: i + 10,
        duration: 10050,
      })
    }
  }
  else {
    for (let i = 0; i < number; i++)
      temp.push(`${i}vite`)
  }

  return temp
}

const plugins = computed((): PluginInfoWithMetic[] => {
  const plugins: string[] = test(true)
  const metics: PluginMetric[] = test() as PluginMetric[]

  return plugins.map((plugin, idx) => {
    const p = typeof plugin === 'string' ? { src: plugin } : plugin
    return {
      ...p,
      src: `vue/dist/pages/runtime/plugins/router.js${idx}vite`,
      metric: metics.find(m => m.src === p.src || m.src.startsWith(p.src)),
      ssr: false,
      mode: 'client',
    }
  })
})

const totalTime = computed(() => {
  const metics: PluginMetric[] = test() as PluginMetric[]
  const minStart = Math.min(...metics.map(m => m.start))
  const maxEnd = Math.max(...metics.map(m => m.end))
  return maxEnd - minStart
})
</script>

<template>
  <VSectionBlock icon="carbon-plug" text="Plugins" :border="true" :description="`Total plugins: ${plugins.length}`">
    <div class="plugin-container" :style="{
      height: h
    }" overflow-auto>
      <PluginItem v-for="plugin, idx of plugins" :key="idx" :plugin="plugin" :index="idx + 1" ml--4 border-base py2
        :class="idx ? 'border-t' : ''" />

    </div>
  </VSectionBlock>
  <div class="text-sm" flex="~ gap-1 items-center justify-end" pr-3 mb-3>
    <div i-carbon-timer text-lg op75 />
    <span op50>Total execution time:</span>
    <DurationDisplay :duration="totalTime" :factor="10" />
  </div>
  <!-- <HelpFab>
    <DocsPlugins />
  </HelpFab> -->
</template>

<style scoped>
</style>
