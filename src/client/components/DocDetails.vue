<script setup lang="ts">
const props = defineProps<{
  data: {
    name: string
    description: string
    website: string
    github: string
    icon: string
  }
}>()
const githubBase = 'https://github.com/'
</script>

<template>
  <VCard p4 flex="~ gap2" max-h="50vh">
    <div flex="~ col gap2" flex-auto of-hidden px1>
      <div of-hidden text-ellipsis ws-nowrap text-lg>
        <span>
          {{ data.name }}
        </span>
      </div>

      <div v-if="data.description" :class="compact ? 'ws-nowrap of-hidden truncate' : 'line-clamp-2'" mt--1 text-sm op50>
        {{ data.description }}
      </div>

      <div flex-auto />

      <div v-if="data.website" flex="~ gap-2" title="Documentation">
        <span i-carbon-link text-lg op50 />
        <a :href="data.website" target="_blank" of-hidden truncate ws-nowrap text-sm op50
          hover="op100 underline text-primary">
          {{ data.website.replace(/^https?:\/\//, '') }}
        </a>
      </div>
      <div v-if="data.github" flex="~ gap-2">
        <span i-carbon-logo-github text-lg op50 />
        <a :href="data.github" target="_blank" of-hidden truncate ws-nowrap text-sm op50
          hover="op100 underline text-primary">
          {{ data.github.replace(/^https?:\/\/github.com\//, '') }}
        </a>
      </div>

      <slot name="items" />
    </div>
    <div flex="~ col">
      <div v-if="data.icon" h-20 w-20 flex flex-none rounded bg-gray:3 p4>
        <img v-if="data.icon" :src="data.icon" :alt="name" ma h-full>
      </div>
    </div>
  </VCard>
</template>
