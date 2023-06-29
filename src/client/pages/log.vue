<script setup lang="ts">
const logger = ref('')

console.log = function(message){
  logger.value += message + '<br />'
}

function handleOne(){
  console.log('one')
}

function handleClear(){
  logger.value = ''
}
</script>

<template>
  <div>
    <button class="px-5 bg-sky" @click="handleOne">console.log('one')</button>
    <button class="bg-sky px-5 ml-3" @click="handleClear">clear</button>
    <div v-html="logger" />
  </div>
</template>
