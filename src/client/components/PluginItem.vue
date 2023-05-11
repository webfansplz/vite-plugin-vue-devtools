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

const props = defineProps<{
  plugin: PluginInfoWithMetic
  index?: number
}>()

const shortPath = '#dada'
</script>

<template>
  <div flex="~ gap2" items-center>
    <div w8 text-right text-sm op25>
      {{ index }}
    </div>
    <FilepathItem :filepath="props.plugin.src" :subpath="true" />
    <div>
      <Badge
        v-if="shortPath.startsWith('#')"
        bg-rose-400:10 text-rose
        v-text="'virtual'"
      />
      <Badge
        v-else-if="!shortPath.startsWith('.')"
        bg-gray-400:10 text-gray
        v-text="'module'"
      />
      <Badge
        v-if="plugin.mode === 'server'"
        bg-teal-400:10 text-teal-400
        v-text="'server'"
      />
      <Badge
        v-if="plugin.mode === 'client'"
        bg-orange-400:10 text-orange-400
        v-text="'client'"
      />
    </div>
    <div v-if="plugin.metric?.duration != null" flex-auto text-right>
      <DurationDisplay :duration="plugin.metric?.duration" :factor="10" />
    </div>
  </div>
</template>
