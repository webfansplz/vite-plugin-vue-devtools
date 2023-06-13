<script setup lang="ts">
import { useDevtoolsClient } from '../logic/client'

const client = useDevtoolsClient()
const frameState = useFrameState()
const router = useRouter()
const color = ref('')

useEventListener('keydown', (e) => {
  if (e.key === 'Escape')
    close()
})

function close() {
  client.value?.panel?.toggleViewMode()
  router.replace(frameState.route.value)
}

async function open() {
  // @ts-expect-error missing types?
  const eyeDropper = new EyeDropper()
  return eyeDropper.open()
}

async function restart() {
  color.value = ''
  open().then((res) => {
    color.value = res.sRGBHex
  })
}

onMounted(() => {
  open().then((res) => {
    color.value = res.sRGBHex
  })
})
</script>

<template>
  <VPanelGrids h-screen w-screen px5>
    <div absolute right-0 top-0 p2>
      <button carbon-close ma text-xl op50 hover:op100 @click="close" />
    </div>
    <div v-if="!color">
      Launching EyeDropper
    </div>
    <div v-else flex items-center>
      <span flex items-center>
        <em mr-2 inline-block h-5 w-5 border border-base rounded :style="{ backgroundColor: color }" />
        :
        {{ color }}
      </span>
      <span ml-2 flex cursor-pointer items-center border border-base rounded-10 p-2 hover="bg-active" @click="restart">
        <i class="i-mdi:eyedropper" text-3 />
      </span>
    </div>
  </VPanelGrids>
</template>
