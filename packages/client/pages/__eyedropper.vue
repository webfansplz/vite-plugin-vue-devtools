<script setup lang="tsx">
import { useDevToolsClient } from '../logic/client'

const client = useDevToolsClient()
const frameState = useFrameState()
const router = useRouter()
const hexColor = ref('')
const showHex = ref(true)
const color = computed(() => showHex.value ? hexColor.value : hexToRgb(hexColor.value))
const copy = useCopy()

function getDecimal(hex: string, start: number, end: number) {
  return Number.parseInt(hex.slice(start, end), 16)
}

function hexToRgb(hex: string) {
  return hex ? `rgb(${getDecimal(hex, 1, 3)},${getDecimal(hex, 3, 5)},${getDecimal(hex, 5, 7)})` : ''
}

useEventListener('keydown', (e) => {
  if (e.key === 'Escape')
    close()
})

function close() {
  client.value?.panel?.toggleViewMode()
  router.replace(frameState.route.value)
}

const inSecurityContext = checkIsSecurityContext()
// @ts-expect-error missing types
const supportEyeDropper = !!window.EyeDropper
const isSupported = inSecurityContext && supportEyeDropper

async function open() {
  if (!isSupported)
    return
  // @ts-expect-error missing types?
  const eyeDropper = new EyeDropper()
  return eyeDropper.open()
}

async function restart() {
  hexColor.value = ''
  open().then((res) => {
    hexColor.value = res.sRGBHex
  }).catch(() => {
    close()
  })
}

onMounted(() => {
  open().then((res) => {
    hexColor.value = res.sRGBHex
  }).catch(() => {
    close()
  })
})

function ErrorBoundary() {
  let content: JSX.Element = <div></div>
  if (!inSecurityContext) {
    content = <p>
    EyeDropper is not available due to <a class="text-primary transition-colors hover:text-primary/80" href="https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts" target='_blank'>secure context</a> restrict.
    </p>
  }
  else if (!supportEyeDropper) {
    content = <p>
      Your browser doesn't support&nbsp;
       <a class="text-primary transition-colors hover:text-primary/80" href="https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper#browser_compatibility" target='_blank'>EyeDropper</a>.
    </p>
  }
  return <div class="flex items-center justify-center text-12px">
    { content }
  </div>
}
</script>

<template>
  <VPanelGrids h-screen w-screen px5>
    <div absolute right-0 top-0 p2>
      <button carbon-close ma text-xl op50 hover:op100 @click="close" />
    </div>
    <div v-if="isSupported">
      <div v-if="!color">
        Launching EyeDropper
      </div>
      <div v-else flex items-center>
        <span flex items-center>
          <em mr-2 inline-block h-5 w-5 border border-base rounded hover="cursor-pointer border-primary" :style="{ backgroundColor: color }" @click="showHex = !showHex" />
          :
          <span hover="underline underline-offset-3 cursor-pointer" @click="copy(color)">{{ color }}</span>
        </span>
        <span ml-2 flex cursor-pointer items-center border border-base rounded-10 p-2 hover="bg-active" @click="restart">
          <i class="i-mdi:eyedropper" text-3 />
        </span>
      </div>
    </div>
    <ErrorBoundary v-else />
  </VPanelGrids>
</template>
