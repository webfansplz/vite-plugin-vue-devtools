<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppStore } from '../stores'

const store = useAppStore()
const { increment } = store
const { count } = storeToRefs(store)
const doubledCount = computed(() => count.value * 2)
</script>

<template>
  <div
    style="width: 500px; height: 300px; display: flex;
    justify-content: center; align-items: center; flex-wrap: wrap;
    padding: 10px; box-sizing: border-box; margin-top: 20px;"
  >
    <span class="w-full">COUNTER</span>
    <span class="w-full">
      count -> {{ count }}
    </span>
    <span class="w-full">
      doubledCount -> {{ doubledCount }}
    </span>
    <button class="w-full" @click="increment">
      increment
    </button>
  </div>
</template>

<style scoped>
.w-full {
  width: 100%;
}
</style>
