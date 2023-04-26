import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCounterStore = defineStore('counter', () => {
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
