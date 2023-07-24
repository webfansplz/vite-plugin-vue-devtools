<script setup lang="ts">
import ComponentInspector from './ComponentInspector.vue'
import { useRerenderHighlight } from './composables'

const { rerenderHighlightMap } = useRerenderHighlight()

const colors = [
  ['#ff5555', 50],
  ['#fff888', 20],
] as const

function getColors(times: number) {
  const [color] = colors.find(([_, t]) => times >= t) || '#fff'
  return color as string
}
</script>

<template>
  <template v-for="[name, { bound, rerenderCount }] in rerenderHighlightMap.entries()" :key="name">
    <ComponentInspector
      :bounds="bound"
      :name="name"
    >
      <template #header-extra>
        <span
          v-if="rerenderCount" :style="{
            marginLeft: '5px',
            color: getColors(rerenderCount),
          }"
        >x {{ rerenderCount + 1 }}</span>
      </template>
    </ComponentInspector>
  </template>
</template>
