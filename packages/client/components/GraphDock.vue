<script setup lang="tsx">
import type { FunctionalComponent } from 'vue'
import { StateGraphStateEnum, currentFullCodeAndFilename, stateGraphState } from '../logic/state-graph'

const errorBoundaryMessages: Partial<Record<StateGraphStateEnum, string>> = {
  [StateGraphStateEnum.NOT_READY]: 'Is not ready yet.',
  [StateGraphStateEnum.NOT_SELECT_FILE]: 'You have not selected a file yet.',
  [StateGraphStateEnum.NOT_COLLECTED]: 'This file has not been collected or does\'t support.',
  [StateGraphStateEnum.NO_STATE]: 'This file does not have any state that supported to analyze.',
}

const ErrorBoundary: FunctionalComponent<{
  state: StateGraphStateEnum
}> = ({ state }) =>
  <div class="h-full w-full flex items-center justify-center">
    <div class="rounded-lg bg-red-4 p2 text-white">
        {errorBoundaryMessages[state]}
    </div>
  </div>

const tabs = [
  {
    name: 'StateGraph',
    icon: 'i-carbon-data-vis-1',
  },
  {
    name: 'Code',
    icon: 'i-carbon-code',
  },
] as const

const activeTab = ref<(typeof tabs)[number]['name']>(tabs[0].name)
</script>

<template>
  <ErrorBoundary v-if="stateGraphState !== StateGraphStateEnum.HAS_STATE" :state="stateGraphState" />
  <div v-else class="grid grid-rows-[30px_1fr] h-full w-full p2">
    <nav class="h30px w-full flex items-center gap1">
      <div v-for="item of tabs" :key="item.name" class="cursor-pointer p1" :class="[activeTab === item.name ? 'text-primary' : '']" @click="activeTab = item.name">
        <div :class="[item.icon]" />
      </div>
    </nav>
    <StateGraph v-if="activeTab === 'StateGraph'" />
    <Suspense v-else-if="activeTab === 'Code'">
      <HighlightCode class="h-full overflow-hidden" v-bind="currentFullCodeAndFilename" />
      <template #fallback>
        <div class="h-full w-full flex items-center justify-center">
          <VDLoading class="h-30px w-30px" />
        </div>
      </template>
    </Suspense>
  </div>
</template>
