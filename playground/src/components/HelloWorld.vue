<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

defineProps<{ msg: string }>()

const count = ref(30)
</script>

<template>
  <h1>{{ msg }}</h1>
  {{ count }}

  <Child msg="123456" />
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
