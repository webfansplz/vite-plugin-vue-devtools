import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const count = ref(120)
  function increment() {
    count.value++
  }

  return { count, increment }
})

export const useCounterStore = defineStore('counter', () => {
  const count = ref(10)
  const name = ref('webfansplz!!!')
  function increment() {
    count.value++
  }

  return { count, name, increment }
})

export const useCounter2Store = defineStore('counter-2', () => {
  const count = ref(0)
  const name = ref('webfansplz')
  function increment() {
    count.value++
  }

  return { count, name, increment }
})

export const useUserStore = defineStore('user', {
  state: () => ({ name: 'webfansplz', age: 18 }),
  getters: {
    double: state => state.age * 2,
  },
  actions: {
    increment() {
      this.age++
    },
  },
})
