<script setup lang="ts">
import dayjs from 'dayjs'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

defineProps<{
  data: any[]
  selected: number
}>()

const emits = defineEmits(['update-selected'])
</script>

<template>
  <ul v-if="data.length">
    <RecycleScroller
      v-slot="{ item, index }"
      :items="data"
      :min-item-size="40"
      key-field="id"
      page-mode
    >
      <li
        border="b base" h-10 flex cursor-pointer select-none items-center pl-3 pr-2 text-xs space-x-2
        :class="[index === selected ? 'vue-block-active' : 'vue-block-hover']"
        @click="emits('update-selected', index)"
      >
        <span flex-1 truncate font-mono space-x-1>
          <span
            font-medium
            :class="[index === selected ? 'text-white' : 'text-purple-600 dark:text-purple-400']"
          >{{ item.event.title }}</span>
          <span opacity-75>{{ item.event.subtitle }}</span>
        </span>
        <span flex-none font-mono opacity-50>{{ dayjs(item.event.now).format('HH:mm:ss') }}</span>
      </li>
    </RecycleScroller>
    <!-- <li
      v-for="(item, index) in data" :key="index"
      border="b base" h-10 flex cursor-pointer select-none items-center pl-3 pr-2 text-xs space-x-2
      :class="[index === selected ? 'vue-block-active' : 'vue-block-hover']"
      @click="emits('update-selected', index)"
    >
      <span flex-1 truncate font-mono space-x-1>
        <span
          font-medium
          :class="[index === selected ? 'text-white' : 'text-purple-600 dark:text-purple-400']"
        >{{ item.event.title }}</span>
        <span opacity-75>{{ item.event.subtitle }}</span>
      </span>
      <span flex-none font-mono opacity-50>{{ dayjs(item.event.now).format('HH:mm:ss') }}</span>
    </li> -->
  </ul>
  <VPanelGrids v-else px5>
    <VCard flex="~ col gap2" min-w-30 items-center p3>
      <h1 text-sm italic op50>
        No Events
      </h1>
    </VCard>
  </VPanelGrids>
</template>
