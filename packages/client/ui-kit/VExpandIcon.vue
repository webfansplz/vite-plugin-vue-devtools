<script setup lang="ts">
defineProps<{
  value: boolean
}>()
</script>

<template>
  <VIcon
    class="material-symbols:arrow-right" n-transition text-5 op-50
    :class="{
      'transform rotate-90': value,
    }"
  />
</template>
