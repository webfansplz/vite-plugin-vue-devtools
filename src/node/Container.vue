<script setup>
import { computed, ref } from 'vue'

const panelState = ref({
  position: 'bottom',
})

window.__VUE_DEVTOOLS_TOGGLE_PANEL_POSITION__ = (position) => {
  panelState.value.position = position
}

const panelStyle = computed(() => {
  if (panelState.value.position === 'bottom') {
    return {
      transform: 'translateX(-50%)',
      bottom: '10px',
      left: '50%',
    }
  }
  else if (panelState.value.position === 'top') {
    return {
      transform: 'translateX(-50%)',
      top: '10px',
      left: '50%',
    }
  }
  else if (panelState.value.position === 'left') {
    return {
      transform: 'translateY(-50%)',
      top: '50%',
      left: '10px',
    }
  }
  else {
    return {
      transform: 'translateY(-50%)',
      top: '50%',
      right: '10px',
    }
  }
})
const toggleButtonPosition = computed(() => {
  if (panelState.value.position === 'left') {
    return {
      'left': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '0 100px 100px 0',
      '--hover-translate': 'translateX(3px)',
    }
  }
  if (panelState.value.position === 'right') {
    return {
      'right': '-8px',
      'top': 'calc(50% - 25px)',
      'height': '35px',
      'width': '35px',
      'borderRadius': '100px 0 0 100px',
      '--hover-translate': 'translateX(-3px)',
    }
  }
  if (panelState.value.position === 'top') {
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
})
const panelVisible = ref(false)
const panelPosition = computed(() => panelVisible.value ? panelStyle.value : { zIndex: -100000 })

function togglePanel() {
  panelVisible.value = !panelVisible.value
}
</script>

<template>
  <div class="vue-devtools-panel" :style="panelPosition">
    <iframe src="/__devtools/" />
  </div>
  <button class="vue-devtools-toggle" aria-label="Toggle devtools panel" :style="toggleButtonPosition" @click="togglePanel">
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
  width: calc(80vw - 20px);
  height: calc(60vh - 20px);
}

.vue-devtools-panel iframe {
  width: 100%;
  height: 100%;
  outline: 0;
  border:1px solid rgba(125,125,125,0.2);
  border-radius: 8px;
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
