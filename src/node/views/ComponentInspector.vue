<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bounds: {
    width: number
    height: number
    top: number
    left: number
  }
  name: string
}>()

const inspectorStyle = computed(() => {
  const { width, height, top, left } = props.bounds
  return {
    width: `${Math.round(width)}px`,
    height: `${Math.round(height)}px`,
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  }
})
const inspectorCardStyle = computed(() => ({ top: props.bounds.top < 35 ? 0 : '-35px' }))
</script>

<template>
  <div class="vue-devtools-component-inspector" :style="inspectorStyle">
    <span class="vue-devtools-component-inspector-card" :style="inspectorCardStyle">
      &lt;{{ name }}&gt;
      <i>{{ Math.round(bounds.width * 100) / 100 }} x {{ Math.round(bounds.height * 100) / 100 }}</i>
    </span>
  </div>
</template>

<!-- <style scoped>
</style> -->
