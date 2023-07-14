<script setup lang="ts">
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { hookApi } from '../logic/hook'

const container = ref<HTMLElement>()
let term: Terminal

onMounted(async () => {
  term = new Terminal({
    convertEol: true,
    cols: 80,
    screenReaderMode: true,
  })
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  term.open(container.value!)
  fitAddon.fit()

  useEventListener(window, 'resize', () => {
    fitAddon.fit()
  })

  hookApi.hook.on('__vue-devtools:terminal:data__', (data: string) => {
    term.write(data)
  })
  hookApi.hook.on('__vue-devtools:terminal:exit__', () => {
    clear()
  })
})

function clear() {
  term?.clear()
}
</script>

<template>
  <div ref="container" h-full w-full of-auto bg-black />
</template>
