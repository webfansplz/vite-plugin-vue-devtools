<script setup lang="ts">
import { rpc } from '../logic/rpc'

import { data } from '../logic/documentations'

const items = ref(data)
rpc.getPackages().then((res) => {
  const packagesName = Object.keys(res.packages)
  items.value = items.value.filter(item => packagesName.includes(item.id))
})
</script>

<template>
  <div grid grid-cols-minmax-400px h-screen select-none gap3 overflow-scroll p4 class="no-scrollbar">
    <DocDetails v-for="(item, index) in items" :key="index" :data="item" />
  </div>
</template>
