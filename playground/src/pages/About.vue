<script setup lang="ts">
import { ref } from 'vue'
import { useCounterStore, useUserStore } from '../stores'

const store = useCounterStore()

const userStore = useUserStore()
const count = ref(10)
</script>

<template>
  <div>
    About
  </div>
  <h3 @click="store.increment">
    {{ store.count }}
  </h3>
  <p>
    {{ userStore.name }}
  </p>
</template>
