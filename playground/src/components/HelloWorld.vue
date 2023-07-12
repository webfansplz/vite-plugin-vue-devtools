<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore } from '../stores'
import Child from './Child.vue'

defineProps<{ msg: string }>()

const counterStore = useCounterStore()
const count = ref(10)
</script>

<template>
  <h1>{{ msg }}</h1>
  <button @click="counterStore.increment">
    {{ counterStore.count }}
  </button>
  {{ count }}

  <Child msg="123456" />
</template>
