<script setup lang="ts">
const groupTabs = useGroupedTabs()
</script>

<template>
  <div flex items-center gap-12px>
    <VButton>
      <div i-material-symbols-ungroup />
      Reset group
    </VButton>
  </div>
  <TabGroupItem v-for="[name, tabs] in groupTabs" :key="name" :group-name="name" :tabs="tabs" />
</template>
