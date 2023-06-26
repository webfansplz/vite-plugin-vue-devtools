<script setup lang="ts">
import { computed, ref } from 'vue'
import Frame from './FrameBox.vue'
import { state, usePanelVisible, usePosition } from './composables'
import { checkIsSafari } from './utils'

const props = defineProps({
  hook: {
    type: Object,
  },
})

const { togglePanelVisible } = usePanelVisible()
const panelEl = ref<HTMLDivElement>()
const { onPointerDown, anchorStyle, iframeStyle, isDragging, isVertical } = usePosition(panelEl)
const vars = computed(() => {
  const dark = true
  return {
    '--vue-devtools-widget-bg': dark ? '#111' : '#ffffff',
    '--vue-devtools-widget-fg': dark ? '#F5F5F5' : '#111',
    '--vue-devtools-widget-border': dark ? '#3336' : '#efefef',
    '--vue-devtools-widget-shadow': dark ? 'rgba(0,0,0,0.3)' : 'rgba(128,128,128,0.1)',
  }
})
</script>

<template>
  <div
    id="vue-devtools-anchor"
    :style="[anchorStyle, vars]"
    :class="{ 'vue-devtools-vertical': isVertical }"
  >
    <Frame :style="iframeStyle" :is-dragging="isDragging" />
    <!-- toggle button -->
    <div v-if="!checkIsSafari()" class="vue-devtools-glowing" :style="isDragging ? 'opacity: 0.6 !important' : ''" />
    <div ref="panelEl" class="vue-devtools-button-panel" @pointerdown="onPointerDown">
      <button
        class="vue-devtools-icon-button vue-devtools-vue-button"
        title="Toggle Vue DevTools" aria-label="Toggle devtools panel"
        :style="state.open ? '' : 'filter:saturate(0)'"
        @click="togglePanelVisible"
      >
        <svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
          <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
          <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
        </svg>
      </button>
      <div style="border-left: 1px solid #8883;width:1px;height:10px;" />
      <button class="vue-devtools-icon-button" title="Toggle Component Inspector" @click="client.inspector.toggle">
        <!-- :style="client.inspector.isEnabled.value ? 'opacity:1;color:#00dc82' : ''" -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style="height: 1.2em; width: 1.2em; opacity:0.5;opacity:1;color:#00dc82"
          viewBox="0 0 24 24"
        >
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r=".5" fill="currentColor" /><path d="M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0m7-9v2m-9 7h2m7 7v2m7-9h2" /></g>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
#vue-devtools-anchor {
  position: fixed;
  z-index: 2147483645;
}

#vue-devtools-anchor button {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
  color: inherit;
}

#vue-devtools-anchor .vue-devtools-glowing {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  opacity: 0;
  transition: all 0.8s ease;
  pointer-events: none;
  z-index: -1;
  border-radius: 9999px;
  background-image: linear-gradient(45deg,#00dc82,#36e4da,#0047e1);
  filter: blur(60px);
}

#vue-devtools-anchor .vue-devtools-icon-button {
  border-radius: 100%;
  border-width: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
}
#vue-devtools-anchor .vue-devtools-icon-button:hover {
  opacity: 1;
}

#vue-devtools-anchor .vue-devtools-icon-button svg {
  width: 16px;
  height: 16px;
}

#vue-devtools-anchor:hover .vue-devtools-glowing {
  opacity: 0.6;
}

#vue-devtools-anchor .vue-devtools-button-panel {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  height: 30px;
  padding: 4px 4px 4px 5px;
  border: 1px solid var(--vue-devtools-widget-border);
  border-radius: 20px;
  background-color: var(--vue-devtools-widget-bg);
  backdrop-filter: blur(10px);
  color: var(--vue-devtools-widget-fg);
  box-shadow: 2px 2px 8px var(--vue-devtools-widget-shadow);
  transition: background 0.2s ease;
  user-select: none;
}

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-vue-button {
  transform: rotate(-90deg);
}

#vue-devtools-anchor.vue-devtools-vertical .vue-devtools-button-panel {
  transform: translate(-50%, -50%) rotate(90deg);
  box-shadow: 2px -2px 8px var(--nuxt-devtools-widget-shadow);
}
</style>
