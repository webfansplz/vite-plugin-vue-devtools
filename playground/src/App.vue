<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from './stores'

const appStore = useAppStore()
// const count = ref(100)

// const map = new Map([['a', 1], ['b', 2]])
// function add(x: number, y: number) {
// }

// const doubleCount = computed(() => {
//   return count.value * 3
// })

// const list = ref<any[]>([0, 1, 2, 3, 4, ref([1, 2, 3, 4, 5])])

// const info = ref({
//   name: 'webfansplz',
//   age: 18,
// })

const router = useRouter()
</script>

<template>
  {{ appStore.count }}
  <RouterView />
  <!-- <HelloWorld msg="Vite + Vue" /> -->
  <button @click="router.push('/about')">
    go
  </button>
  <button @click="router.go(-1)">
    back
  </button>
  <button @click="appStore.increment()">
    increment
  </button>
</template>

<style scoped>
button {
  margin: 0 5px;
}
</style>
