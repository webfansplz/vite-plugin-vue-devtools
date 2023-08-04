<script>
</script>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAppStore } from '../stores'

const { count } = storeToRefs(useAppStore())

const a = 1
const refValue = ref(2)
</script>

<template>
  <div>
    count -> {{ count }} ;
    doubledCount -> {{ count * 2 }}
  </div>
</template>
