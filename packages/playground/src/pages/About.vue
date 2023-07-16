<script setup lang="ts">
import { useUserStore } from '../stores'

// const store = useAppStore()

const userStore = useUserStore()
// const count = ref(10)
</script>

<template>
  <div>
    About Page
  </div>
  <h3>
    name: {{ userStore.name }}
  </h3>
  <h3 @click="userStore.increment">
    age: {{ userStore.age }}
  </h3>
</template>
