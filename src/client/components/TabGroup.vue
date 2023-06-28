<script setup lang="ts">
const groupTabs = useGroupedTabs()
</script>

<template>
  <div flex items-center gap-12px>
    <VButton n="primary">
      <div i-material-symbols-ungroup />
      Reset group
    </VButton>
  </div>
  <TabGroupItem
    v-for="[name, tabs] in groupTabs" :key="name" :tabs="tabs" :group-name="name"
  />
</template>
