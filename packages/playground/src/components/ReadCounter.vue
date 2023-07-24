<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '../stores'

const { count } = storeToRefs(useAppStore())
</script>

<template>
  <div>
    count -> {{ count }} ;
    doubledCount -> {{ count * 2 }}
  </div>
</template>
