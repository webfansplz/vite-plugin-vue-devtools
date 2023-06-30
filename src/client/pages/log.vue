<script setup lang="ts">
const logger = ref<any[]>([])

console.log = function(message){
  logger.value.push(message)
}

window.top.console.log = function(message){
  logger.value.push(message)
}

function handleOne(){
  console.log('one')
}

function handleClear(){
  logger.value = []
  console.clear()
}
</script>

<template>
  <div>
    <button class="px-5 bg-sky" @click="handleOne">console.log('one')</button>
    <button class="bg-sky px-5 ml-3" @click="handleClear">clear</button>
    <div>{{ logger }}</div>
  </div>
</template>
