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

<style scoped>
.vue-devtools-component-inspector {
  z-index: 2147483640;
  position: fixed;
  background-color:#42b88325;
  border: 1px solid #42b88350;
  border-radius: 5px;
  transition: all 0.1s ease-in;
  pointer-events: none;
}

.vue-devtools-component-inspector-card {
  font-family: Arial, Helvetica, sans-serif;
  padding: 5px 8px;
  border-radius: 4px;
  text-align: left;
  position: absolute;
  left: 0;
  color:#e9e9e9;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  background-color:#42b883;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
}

.vue-devtools-component-inspector-card i {
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  opacity: 0.7;
}
</style>
