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

function handleConsole() {
  console.log('hello world')
}

function handleDeBugConsole(){
  console.debug('hello debug')
}
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
  <div style="margin-top: 5px;">
    <button @click="handleConsole">
      console.log('hello world')
    </button>
    <button @click="handleDeBugConsole">
      console.debug('hello world')
    </button>
    <button @click="handleDeBugConsole">
      console.error('hello world')
    </button>
  </div>


</template>
