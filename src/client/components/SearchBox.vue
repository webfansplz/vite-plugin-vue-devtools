<script setup lang="ts">
import { exactSearch, includeNodeModules, includeVirtual, searchText } from '../logic/graph'
</script>

<template>
  <nav h-54px flex="~ none gap-4" border="b base" pl-4 pr-6 font-light children:my-auto>
    <div i-carbon-ibm-watson-discovery title="Vite Inspect" text-xl />
    <input
      v-model="searchText"
      type="text"
      class="border border-base rounded bg-transparent px-3 py-1 !outline-none"
      placeholder="Search..."
    >
    <div class="h-min flex flex-col select-none text-xs">
      <label class="flex">
        <input v-model="includeNodeModules" type="checkbox" class="my-auto">
        <div class="ml-1">node_modules</div>
      </label>
      <div class="flex gap-2">
        <label class="flex">
          <input v-model="includeVirtual" type="checkbox" class="my-auto">
          <div class="ml-1">virtual</div>
        </label>
        <label class="flex">
          <input v-model="exactSearch" type="checkbox" class="my-auto">
          <div class="ml-1">exact search</div>
        </label>
      </div>
    </div>
  </nav>
</template>
