<script setup lang="ts">
import type { StateType } from '../logic/format-state'
import { formatStateType } from '../logic/format-state'

const props = withDefaults(defineProps<{
  id: number
  data: unknown
  depth: number
  expandedId: string[]
}>(), {
  depth: 0,
})

const emits = defineEmits<{
  (e: 'updateExpanded', id: string): void
}>()
const rawTypeStyles: Record<string, string> = { literal: 'raw-literal', string: 'raw-string', object: 'raw-object', function: 'raw-function', null: 'raw-null' }

const list = computed(() => {
  // TODO: sort by type
  if (Array.isArray(props.data)) {
    return props.data.map((item) => {
      return formatStateType(item)
    }) as unknown as StateType[]
  }

  else if (typeof props.data === 'object' && props.data !== null) {
    const o = {} as Record<string, Partial<StateType>>
    for (const k in props.data) {
      const key = k
      o[key] = formatStateType((props.data as Record<string, StateType>)[k])!
    }

    return o as unknown as StateType[]
  }
  else {
    return formatStateType('') as unknown as StateType[]
  }
})

function toggleExpand(id: string) {
  emits('updateExpanded', id)
}
</script>

<template>
  <code v-for="(item, index) in list" :key="index" block select-none pl-2 text-sm>
    <p flex items-center :class="[item?.recursive && 'cursor-pointer']" @click="item?.recursive ? toggleExpand(`${id}-${depth}-${index}`) : () => {}">
      <VExpandIcon v-if="item?.recursive" :value="expandedId.includes(`${id}-${depth}-${index}`)" />
      <i v-else inline-block h-6 w-6 />
      <span text-purple-700 dark:text-purple-300>{{ index }}</span>
      <span px-1 op-60>:</span>
      <span v-if="item?.recursive" :class="rawTypeStyles[item.rawType]" max-w="[75%]" truncate v-html="item?.rawDisplay" />
      <span v-else :class="rawTypeStyles[item.rawType]" max-w="[75%]" truncate v-html="item?.value" />
    </p>
    <VStateType
      v-if="expandedId.includes(`${id}-${depth}-${index}`) && item?.recursive && depth <= 1"
      :id="id"
      :data="item?.value"
      :depth="depth + 1"
      :expanded-id="expandedId"
      @update-expanded="toggleExpand"
    />
  </code>
</template>
