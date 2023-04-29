<script setup lang="ts">
import { computed, ref } from 'vue'

const panelVisible = ref(false)
const panelPosition = computed(() => panelVisible.value ? { bottom: '10px', left: '50%' } : { bottom: '-9999px', left: '-9999px' })
const state = ref({
  position: 'bottom',
})

function togglePanel() {
  panelVisible.value = !panelVisible.value
}

function getToggleButtonPosition() {
  if (state.value.position === 'left') {
    return {
      'left': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '0 100px 100px 0',
      '--hover-translate': 'translateX(3px)',
    }
  }
  if (state.value.position === 'right') {
    return {
      'right': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '100px 0 0 100px',
      '--hover-translate': 'translateX(-3px)',
    }
  }
  if (state.value.position === 'top') {
    return {
      'top': '-3px',
      'left': 'calc(50% - 25px)',
      'borderRadius': '0 0 100px 100px',
      'height': '30px',
      'width': '40px',
      '--hover-translate': 'translate(0, 3px)',
    }
  }
  return {
    'bottom': '-5px',
    'left': 'calc(50% - 25px)',
    'borderRadius': '100px 100px 0 0',
    'height': '30px',
    'width': '40px',
    '--hover-translate': 'translate(0, -3px)',
  }
}
</script>

<template>
  <iframe src="/__devtools/" class="vue-devtools-panel" :style="panelPosition" />
  <button class="vue-devtools-toggle" aria-label="Toggle devtools panel" :style="getToggleButtonPosition()" @click="togglePanel">
    <svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
      <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
      <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
    </svg>
  </button>
</template>

<style scoped>
.vue-devtools-panel {
  position: fixed;
  /* bottom: 10px; */
  /* left: 50%; */
  outline: 0;
  border:1px solid rgba(125,125,125,0.2);
  border-radius: 8px;
  transform: translateX(-50%);
  width: calc(80vw - 20px);
  height: calc(60vh - 20px);
}

.vue-devtools-toggle {
  position: fixed;
  background: #0C0C0C;
  border: 1px solid rgba(125,125,125,0.2);
  box-shadow: 3px 5px 10px rgba(0,0,0,0.1);
  z-index: 2147483647;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  align-items: center;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  outline: 0;
}

.vue-devtools-toggle:hover {
  transform: var(--hover-translate);
  opacity: 1;
}

.vue-devtools-toggle svg {
  width: 16px;
  height: 16px;
  margin: auto;
  margin-top:3px;
}
</style>
