<script setup lang="ts">
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
        src: `${i}vite`,
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
      src: `${idx}vite`,
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
  <VSectionBlock icon="carbon-plug" text="Plugins" :description="`Total plugins: ${plugins.length}`">
    <div class="plugin-container" overflow-auto pt4>
      <PluginItem
        v-for="plugin, idx of plugins" :key="idx" :plugin="plugin" :index="idx + 1" ml--4 border-base py2
        :class="idx ? 'border-t' : ''"
      />
      <div class="text-sm" flex="~ gap-1 items-center justify-end" mt-3>
        <div i-carbon-timer text-lg op75 />
        <span op50>Total execution time:</span>
        <DurationDisplay :duration="totalTime" :factor="10" />
      </div>
    </div>
  </VSectionBlock>

  <!-- <HelpFab>
    <DocsPlugins />
  </HelpFab> -->
</template>

<style scoped>
  .plugin-container{
    height: 400px;
  }
</style>
