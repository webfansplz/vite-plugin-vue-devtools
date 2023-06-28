<script setup lang="ts">
import { nanoid } from 'nanoid'
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

    const sorted = {}
    Object.keys(o).sort().forEach((key) => {
      sorted[key] = o[key]
    })

    return sorted as unknown as StateType[]
  }
  else {
    return formatStateType('') as unknown as StateType[]
  }
})

function toggleExpand(id: string) {
  emits('updateExpanded', id)
}

const copy = useCopy()
</script>

<template>
  <!-- eslint-disable-next-line vue/valid-v-for -->
  <code v-for="(item, index) in list" :key="nanoid()" block select-none pl-2 text-sm>
    <p flex items-center :class="[item?.recursive && 'cursor-pointer']">
      <VExpandIcon v-if="item?.recursive" :value="expandedId.includes(`${id}-${depth}-${index}`)" @click="item?.recursive && toggleExpand(`${id}-${depth}-${index}`)" />
      <i v-else inline-block h-6 w-6 />
      <span select-text text-purple-700 dark:text-purple-300 @dblclick="copy(String(index))">{{ index }}</span>
      <span px-1 op-60>:</span>
      <span v-if="item?.recursive" :class="rawTypeStyles[item.rawType]" max-w="[75%]" truncate @click="item?.recursive && toggleExpand(`${id}-${depth}-${index}`)" v-html="item?.rawDisplay" />
      <span
        v-else
        :class="rawTypeStyles[item.rawType]"
        max-w="[75%]" truncate
        hover="underline underline-offset-3 cursor-pointer"
        @click="copy(String(item?.value))"
        v-html="item?.value"
      />
    </p>
    <StateFieldsTree
      v-if="expandedId.includes(`${id}-${depth}-${index}`) && item?.recursive"
      :id="id"
      :data="item?.value"
      :depth="depth + 1"
      :expanded-id="expandedId"
      @update-expanded="toggleExpand"
    />
  </code>
</template>
