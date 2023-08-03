<script setup lang="tsx">
import type { FunctionalComponent } from 'vue'
import { StateGraphStateEnum, stateGraphRawData, stateGraphState } from '../logic/state-graph'

const errorBoundaryMessages: Partial<Record<StateGraphStateEnum, string>> = {
  [StateGraphStateEnum.NOT_READY]: 'Is not ready yet.',
  [StateGraphStateEnum.NOT_SELECT_FILE]: 'You have not selected a file yet.',
  [StateGraphStateEnum.NOT_COLLECTED]: 'This file has not been collected.',
  [StateGraphStateEnum.NO_STATE]: 'This file does not have any state.',
}

const ErrorBoundary: FunctionalComponent<{
  state: StateGraphStateEnum
}> = ({ state }) =>
  <div class="h-full w-full flex items-center justify-center">
    <div class="rounded-lg bg-red-4 p2 text-white">
        {errorBoundaryMessages[state]}
    </div>
  </div>
</script>

<template>
  <ErrorBoundary v-if="stateGraphState !== StateGraphStateEnum.HAS_STATE" :state="stateGraphState" />
  {{ stateGraphRawData }}
</template>
