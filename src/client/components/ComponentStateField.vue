<script setup lang="ts">
import { nanoid } from 'nanoid'

const props = withDefaults(defineProps<{
  data: any
  depth?: number
}>(), {
  depth: 0,
})

const expandedId = ref<string[]>([])
function toggleExpand(id: string) {
  if (expandedId.value.includes(id))
    expandedId.value = expandedId.value.filter((i: string) => i !== id)
  else
    expandedId.value.push(id)
}
const MAX_DEPTH = 3
const list = computed(() => {
  if (props.depth > 0) {
    const list: any[] = []
    props.data.forEach((item: any) => {
      for (const k in item) {
        list.push({
          ...normalizeState(item[k]),
          key: k,
          id: nanoid(),
          objectType: isRef(item[k]) ? 'Ref' : undefined,
        })
      }
    })
    return list
  }

  return props.data.map((item: any) => {
    return Object.assign(normalizeState(item.value), {
      key: item.key,
      id: nanoid(),
      objectType: (item.objectType && item.objectType !== 'Reactive') ? item.objectType : undefined,
    })
  })
})
</script>

<template>
  <ul
    text-sm text-purple-700 dark:text-purple-300
    :style="{
      paddingLeft: `${depth * 5}px`,
    }"
  >
    <li
      v-for="(item, index) in list" :key="index"
    >
      <i
        class="i-material-symbols:arrow-right"
        h-6 w-6 text-5 text-gray-400 dark:text-gray-600
        :class="{
          'transform rotate-90': expandedId.includes(item.id),
          'opacity-0': !item.display,
        }"
        @click="toggleExpand(item.id)"
      />

      <span>
        {{ item?.key }}:
      </span>
      <span
        v-if="item.display"
        text="[#444]" dark="text-#bdc6cf"
      >
        {{ item.display }}
      </span>
      <span v-else text="[#03c]" dark="text-#997fff">{{ item?.value }}</span>
      <span v-if="item.objectType" text-gray-500>({{ item.objectType }})</span>
      <ComponentStateField v-if="Array.isArray(item.value) && depth < MAX_DEPTH && expandedId.includes(item.id)" :data="item.value" :depth="depth + 1" />
    </li>
  </ul>
</template>
