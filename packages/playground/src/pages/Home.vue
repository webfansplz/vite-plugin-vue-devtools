<script setup lang="ts">
import Child from '../components/Child.vue'
import Counter from '../components/Counter.vue'
</script>

<template>
  <div>
    Home
  </div>
  <div style="width: 100%; justify-content: center; display: flex;">
    <Counter />
  </div>
  <Child msg="hello word" />
</template>
