<script setup lang="ts">
import { DevToolsHooks } from '@vite-plugin-vue-devtools/core'
import type { DebuggerEvent, Ref } from 'vue'
import { useDevToolsClient } from '~/logic/client'
import { getSetupStateInfo, toRaw } from '~/logic/components/data'

type ComponentInstance = any

interface TraceInfo {
  componentName: string
  key: string
  value: unknown
  dataType: string | null
  updateType: string
}

const client = useDevToolsClient()
const hook = client.value.hook
const isTracing = ref(false)
const result = ref<TraceInfo[]>([])
const traceBuffer = ref<TraceInfo[]>([])

function toggleTracing(state: boolean) {
  isTracing.value = state
}

function normalizeEventInfo(e: DebuggerEvent, instance: ComponentInstance): TraceInfo {
  const info = getSetupStateInfo(e.target)
  // data type
  const dataType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
  // key
  const index = Object.values(instance.devtoolsRawSetupState).map(i => toRaw(i)).indexOf(toRaw(e.target))
  const key = Object.keys(instance.devtoolsRawSetupState)[index]

  // value
  const value = !dataType || info.reactive ? e.target[e.key] : (e.target as Ref).value

  return {
    componentName: '-',
    key,
    value,
    dataType,
    updateType: e.type,
  }
}

function start() {
  result.value = []
  traceBuffer.value = []
  isTracing.value = true
}

function stop() {
  isTracing.value = false
  const typeOrder = { Ref: 0, Computed: 1 }
  result.value = traceBuffer.value.sort((a, b) => typeOrder[a.dataType!] - typeOrder[b.dataType!])
  traceBuffer.value = []
}

hook.on(DevToolsHooks.RENDER_TRACKED, (e: DebuggerEvent, instance: ComponentInstance) => {
  isTracing.value && traceBuffer.value.push(normalizeEventInfo(e, instance))
})

hook.on(DevToolsHooks.RENDER_TRIGGERED, (e: DebuggerEvent, instance: ComponentInstance) => {
  isTracing.value && traceBuffer.value.push(normalizeEventInfo(e, instance))
})
</script>

<template>
  <div h-full w-full of-auto n-panel-grids>
    <div w-full>
      <!-- button -->
      <VDCard flex="~ col gap-2" absolute right-3 top-3 z-20 p1>
        <VTooltip placement="bottom" :distance="12" text-center>
          <i v-if="!isTracing" class="i-fluent:record-12-regular" text="4.7" cursor-pointer text-secondary hover="text-black dark:text-white" @click="start" />
          <i v-else class="i-fluent:record-stop-12-regular" text="4.7" cursor-pointer text-red-600 hover="text-red-800" @click="stop" />
          <template #popper>
            <p text-xs op-50>
              Start Tracing
            </p>
          </template>
        </VTooltip>
        <VTooltip placement="bottom" :distance="12" text-center>
          <i class="i-grommet-icons:clear" text="3.8" cursor-pointer text-secondary hover="text-black dark:text-white" />
          <template #popper>
            <p text-xs op-50>
              Clear
            </p>
          </template>
        </VTooltip>
      </VDCard>

      <div v-if="!result.length" flex="~ items-center justify-center" h-screen>
        <!-- guide -->
        <VDCard v-if="!isTracing && !result.length" flex="~ col gap2" p3 op60>
          <p flex="~ items-center">
            Click the start button
            <button border="~ base" mx-1 inline-flex items-center justify-center p="0.5" @click="start">
              <i class="i-fluent:record-12-regular" text="4.7" cursor-pointer text-secondary hover="text-black dark:text-white" />
            </button>
            to start a new tracing.
          </p>
          <p flex="~ items-center">
            Click the clear button
            <span border="~ base" mx-1 inline-flex items-center justify-center p1>
              <i class="i-grommet-icons:clear" text="3.8" text-secondary />
            </span>
            to clear the results.
          </p>
          <p lh-5>
            Start tracing, do something in the page. Then,<br> press the stop button to show the resulting triggers for page rerenders.
          </p>
        </VDCard>
        <!-- tracing card -->
        <VDCard v-else-if="isTracing && !result.length" flex="~ col gap2" p3>
          <p class="loading-animation">
            Tracing...
          </p>
        </VDCard>
      </div>

      <!-- table -->
      <table v-if="result.length && !isTracing">
        <thead border="b r base" sticky display="table-header-group" top-0 z-10>
          <tr bg-base>
            <th p-2 text-left>
              Component Name
            </th>
            <th p-2 text-center>
              Key
            </th>
            <th p-2 text-center>
              Value
            </th>
            <th p-2 text-center>
              Data Type
            </th>
            <th p-2 text-center>
              Update Type
            </th>
          </tr>
        </thead>
        <tbody border="b r base">
          <tr v-for="(item, index) in result" :key="index" class="group" h-7 border="b dashed transparent hover:base">
            <td text-center text-sm op70>
              {{ item.componentName }}
            </td>
            <td w-30 ws-nowrap pr-1 text-center text-sm font-mono underline op70 hover="text-primary">
              {{ item.key }}
            </td>
            <td w-30 ws-nowrap pr-1 text-center text-sm font-mono op70>
              {{ item.value }}
            </td>
            <td w-30 ws-nowrap pr-1 text-center text-sm font-mono op70>
              {{ item.dataType }}
            </td>
            <td w-30 ws-nowrap pr-1 text-center text-sm font-mono op70>
              {{ item.updateType }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@keyframes loading {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
  }
}

.loading-animation {
  animation: loading 1.5s infinite;
}
</style>
