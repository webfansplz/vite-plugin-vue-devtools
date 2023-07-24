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
  <template v-for="[uid, { bound, rerenderCount, name }] in rerenderHighlightMap.entries()" :key="uid">
    <ComponentInspector
      :bounds="bound"
      :name="name"
    >
      <template #header-extra>
        <span
          v-if="rerenderCount"
        >
          (Rerender Count: <span
            :style="{
              color: getColors(rerenderCount),
            }"
          >{{ rerenderCount + 1 }})</span>
        </span>
      </template>
    </ComponentInspector>
  </template>
</template>
