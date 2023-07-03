<script setup lang="ts">
import { includeNodeModules, includeVirtual, searchText, userCustomGlobPattern } from '../logic/graph'

const { graphSettings } = useGraphSettings()
</script>

<template>
  <nav flex="~ justify-between items-center" border="b base" pl-4 pr-6 font-light children:my-auto>
    <div flex="~ gap-4 items-center" h-54px>
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
        <label class="flex">
          <input v-model="includeVirtual" type="checkbox" class="my-auto">
          <div class="ml-1">virtual</div>
        </label>
      </div>
      <template v-if="graphSettings.enableUserDefinedGlob">
        <div i-mdi-regex title="Glob pattern" text-xl />
        <input
          v-model="userCustomGlobPattern"
          type="text"
          class="w-300px border border-base rounded bg-transparent px-3 py-1 !outline-none"
          placeholder="Your custom glob pattern"
        >
      </template>
    </div>

    <div>
      <slot name="right" />
    </div>
  </nav>
</template>
