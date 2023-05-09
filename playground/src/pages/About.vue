<script setup lang="ts">
import { useUserStore } from '../stores'

// const store = useAppStore()

const userStore = useUserStore()
// const count = ref(10)
</script>

<template>
  <div>
    About1
  </div>
  <h3 @click="userStore.increment">
    {{ userStore.age }}
  </h3>
  <p>
    {{ userStore.name }}
  </p>
</template>
