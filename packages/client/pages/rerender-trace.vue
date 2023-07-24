<script setup lang="ts">
import dayjs from 'dayjs'
import { DevToolsHooks } from '@vite-plugin-vue-devtools/core'
import type { ComponentInternalInstance, DebuggerEvent, Ref } from 'vue'
import { useDevToolsClient } from '~/logic/client'
import { rootPath } from '~/logic/global'
import { getSetupStateInfo, toRaw } from '~/logic/components/data'
import { getInstanceName } from '~/logic/components'

type ComponentInstance = ComponentInternalInstance & {
  devtoolsRawSetupState: Record<string, unknown>
}

interface TraceInfo {
  componentFile: string
  fullFilePath: string
  key: string
  value: unknown
  dataType: string | null
  updateType: string
  updateTime: number
}

const client = useDevToolsClient()
const hook = client.value.hook
const isTracing = ref(false)
const result = ref<TraceInfo[]>([])
const traceBuffer = ref<TraceInfo[]>([])
const shouldHighlight = ref(true)

function generateIndicator(el: HTMLElement, instance: ComponentInstance) {
  const colors = [
    ['#ff5555', 50],
    ['#fff888', 20],
  ] as const
  const { width, height, top, left } = el.getBoundingClientRect()
  const componentName = getInstanceName(instance)
  const getHeaderContent = (times: number = 0) => {
    const name = document.createElement('b')
    name.textContent = `<${componentName}>`
    const timesEl = document.createElement('b')
    if (times > 0) {
      timesEl.textContent = ` x ${times + 1}`
      timesEl.style.color = colors.find(([, t]) => times >= t)?.[0] ?? '#fff'
    }
    return [name, ` ${width} x ${height}`, timesEl]
  }
  const getHeader = () => {
    const header = document.createElement('div')
    header.style.position = 'absolute'
    header.style.top = '-30px'
    header.style.left = '0'
    header.style.height = '30px'
    header.style.lineHeight = '30px'
    header.style.padding = '0 8px'
    header.style.boxSizing = 'border-box'
    header.style.background = '#42b883'
    header.style.color = '#fff'
    header.style.fontSize = '12px'
    return header
  }
  const header = getHeader()
  header.append(...getHeaderContent())
  const getContainer = () => {
    const container = document.createElement('div')
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.position = 'absolute'
    container.style.top = `${top}px`
    container.style.left = `${left}px`
    container.appendChild(header)
    container.style.pointerEvents = 'none'
    container.style.border = '1px solid #42b88350'
    container.style.background = '#42b88325'
    return container
  }
  const container = getContainer()
  return {
    container,
    getHeaderContent,
  }
}

function normalizeEventInfo(e: DebuggerEvent, instance: ComponentInstance): TraceInfo {
  const info = getSetupStateInfo(e.target)
  // file
  const file = instance.type.__file?.replace?.(rootPath, '') ?? '-'
  // data type
  const dataType = info.computed ? 'Computed' : info.ref ? 'Ref' : info.reactive ? 'Reactive' : null
  // key
  const index = Object.values(instance.devtoolsRawSetupState).map(i => toRaw(i)).indexOf(toRaw(e.target))
  const key = index === -1 ? (e.key ?? 'unknown') : Object.keys(instance.devtoolsRawSetupState)[index]

  // value
  const value = !dataType || info.reactive ? e.target[e.key] : (e.target as Ref).value
  return {
    componentFile: file,
    fullFilePath: instance.type.__file ?? '',
    key,
    value,
    dataType: dataType ?? 'unknown',
    updateType: e.type ?? '-',
    updateTime: Date.now(),
  }
}

hook.on(DevToolsHooks.RENDER_TRACKED, (e: DebuggerEvent, instance: ComponentInstance) => {
  isTracing.value && traceBuffer.value.push(normalizeEventInfo(e, instance))
})

hook.on(DevToolsHooks.RENDER_TRIGGERED, (
  e: DebuggerEvent,
  instance: ComponentInstance,
  cb: (el: HTMLElement, getHeaderCOntent: (t: number) => any) => void = () => { },
) => {
  if (isTracing.value) {
    traceBuffer.value.push(normalizeEventInfo(e, instance))
    if (shouldHighlight.value) {
      let el: HTMLElement | null = null
      const instanceEl = instance.vnode.el
      if (instanceEl?.nodeType === Node.TEXT_NODE)
        el = instanceEl?.parentElement
      else if (instanceEl?.nodeType === Node.ELEMENT_NODE)
        el = instanceEl as HTMLElement
      if (el) {
        const { container, getHeaderContent } = generateIndicator(el, instance)
        cb(container, getHeaderContent)
      }
    }
  }
})

function start() {
  result.value = []
  traceBuffer.value = []
  isTracing.value = true
}

function stop() {
  isTracing.value = false
  const typeOrder = { Ref: 0, Computed: 1 }
  result.value = traceBuffer.value.sort((a, b) => typeOrder[a.dataType!] - typeOrder[b.dataType!]).sort((a, b) => a.updateTime - b.updateTime)
  traceBuffer.value = []
}

function clear() {
  if (isTracing.value)
    return
  result.value = []
}

function openInEditor(filePath: string) {
  if (!filePath)
    return
  client.value.openInEditor(filePath)
}
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
          <i class="i-grommet-icons:clear" text="3.8" cursor-pointer text-secondary hover="text-black dark:text-white" @click="clear" />
          <template #popper>
            <p text-xs op-50>
              Clear
            </p>
          </template>
        </VTooltip>
        <VTooltip placement="bottom" :distance="12" text-center>
          <i v-if="!shouldHighlight" class="i-tabler:capture" text="4.7" cursor-pointer text-secondary hover="text-black dark:text-white" @click="shouldHighlight = true" />
          <i v-else class="i-tabler:capture" text="4.7" cursor-pointer text-green-600 hover="text-green-800" @click="shouldHighlight = false" />
          <template #popper>
            <p text-xs op-50>
              Start Tracing
            </p>
          </template>
        </VTooltip>
      </VDCard>

      <div v-if="!result.length" flex="~ items-center justify-center" h-screen>
        <!-- guide -->
        <VDCard v-if="!isTracing && !result.length" flex="~ col gap2" relative p3 op60>
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
          <p flex="~ items-center">
            Click the capture button
            <span border="~ base" mx-1 inline-flex items-center justify-center p1>
              <i class="i-tabler:capture" text="3.8" text-secondary />
            </span>
            to capture the rerender effect element.
          </p>
          <p lh-5>
            Start tracing, do something in the page. Then,<br> press the stop button to show the resulting triggers for page rerenders.
          </p>

          <VDBadge
            absolute right--0.5 top-0 rounded-0 bg-green-400:10 text-green-400
            title="Experimental"
            v-text="'Experimental'"
          />
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
            <th p-2 text-center>
              Component File
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
            <th p-2 text-center>
              Update Time
            </th>
          </tr>
        </thead>
        <tbody border="b r base">
          <tr v-for="(item, index) in result" :key="index" class="group" h-7 border="b dashed transparent hover:base">
            <td max-w-50 of-hidden text-ellipsis px-2 text-center text-sm underline op70 hover="text-primary" @click="openInEditor(item.fullFilePath)">
              {{ item.componentFile }}
            </td>
            <td max-w-30 w-30 of-hidden text-ellipsis ws-nowrap px-2 text-center text-sm font-mono op70>
              {{ item.key }}
            </td>
            <td max-w-30 w-30 of-hidden text-ellipsis ws-nowrap px-2 text-center text-sm font-mono op70>
              {{ item.value }}
            </td>
            <td max-w-30 w-30 of-hidden text-ellipsis ws-nowrap px-2 text-center text-sm font-mono op70>
              {{ item.dataType }}
            </td>
            <td max-w-30 w-30 of-hidden text-ellipsis ws-nowrap px-2 text-center text-sm font-mono op70>
              {{ item.updateType }}
            </td>
            <td max-w-30 w-30 of-hidden text-ellipsis ws-nowrap px-2 text-center text-sm font-mono op70>
              {{ dayjs(item.updateTime).format('HH:mm:ss') }}
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
