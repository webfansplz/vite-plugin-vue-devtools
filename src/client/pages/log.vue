<script setup lang="ts">
enum LoggerColor{
  info = '',
  debug = '#2f54eb'
}

interface Logger{
  type: 'info' | 'debug'
  message: any
  time: Date
}

const logger = ref<Logger[]>([])

console.log = function(message){
  logger.value.push({
    type: 'info',
    message,
    time: new Date()
  })
}

//@ts-expect-error `window.top === windows` so it's ok
window.top.console.log = function(message){
  logger.value.push({
    type: 'info',
    message,
    time: new Date()
  })
}

//@ts-expect-error `window.top === windows` so it's ok
window.top.console.debug = function(message){
  logger.value.push({
    type: 'debug',
    message,
    time: new Date()
  })
}

function handleOne(){
  console.debug('one')
}

function handleClear(){
  logger.value = []
  console.clear()
}
</script>

<template>
  <div ref="box">
    <div
     w="full"
     p="y3"
     m="b1 x1"
     border="b base"
    >
      <div
       i="carbon-trash-can"
       cursor="pointer"
       text-lg
       color="dark:zinc-500 dark:hover:zinc-50 stone-400 hover:stone-950"
       @click="handleClear"
      />
    </div>
    <div of="auto" h="500px">
      <div flex="~" v-for="(log,index) in logger" :key="index">
        <span color="stone-400 dark:zinc-500" m="x1">[{{ log.time.toLocaleString() }}]</span>
        <span :style="`color: ${LoggerColor[log.type]}`">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>
