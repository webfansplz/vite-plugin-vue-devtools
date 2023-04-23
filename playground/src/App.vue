<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCounterStore } from './stores'

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'

const count = ref(100)

const map = new Map([['a', 1], ['b', 2]])
function add(x: number, y: number) {
  console.log('?????')
}

const doubleCount = computed(() => {
  return count.value * 3
})

const list = ref<any[]>([0, 1, 2, 3, 4, ref([1, 2, 3, 4, 5])])

const info = ref({
  name: 'webfansplz',
  age: 18,
})

const store = useCounterStore()

store.increment()

store.increment()
</script>

<template>
  <h3 @click="store.increment">
    {{ store.count }}
  </h3>
  <HelloWorld msg="Vite + Vue" />
</template>
