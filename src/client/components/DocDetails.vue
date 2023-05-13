<script setup lang="ts">
import type { DocumentInfo } from '../../types'

defineProps<{
  data: DocumentInfo
}>()
const emit = defineEmits<{
  (e: 'navigate', data: DocumentInfo): void
}>()

function navigate(path: string) {
  window.open(path, '_blank')
}
</script>

<template>
  <VCard flex="~ gap2" max-h="50vh" cursor-pointer p4 :hover="data.id === 'vue' ? '' : 'border-primary'"
    @click="emit('navigate', data)">
    <div flex="~ col gap2" flex-auto of-hidden px1>
      <div of-hidden text-ellipsis ws-nowrap text-lg>
        <span>
          {{ data.name }}
        </span>
      </div>

      <div v-if="data.description" class="line-clamp-2" mt--1 text-sm op50>
        {{ data.description }}
      </div>

      <div flex-auto />

      <div v-if="data.website" flex="~ gap-2" title="Documentation">
        <span i-carbon-link text-lg op50 />
        <span of-hidden truncate ws-nowrap text-sm op50 hover="op100 underline text-primary"
          @click.self.stop="navigate(data.website)">
          {{ data.website.replace(/^https?:\/\//, '') }}
        </span>
      </div>
      <div v-if="data.github" flex="~ gap-2">
        <span i-carbon-logo-github text-lg op50 />
        <span of-hidden truncate ws-nowrap text-sm op50 hover="op100 underline text-primary"
          @click.self.stop="navigate(data.github)">
          {{ data.github.replace(/^https?:\/\/github.com\//, '') }}
        </span>
      </div>

      <slot name="items" />
    </div>
    <div flex="~ col">
      <div v-if="data.icon" h-20 w-20 flex flex-none rounded bg-gray:3 p4>
        <img v-if="data.icon" :src="data.icon" :alt="data.name" ma h-full>
      </div>
    </div>
  </VCard>
</template>
