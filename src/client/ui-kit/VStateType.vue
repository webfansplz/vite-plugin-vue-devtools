<script setup lang="ts">
import type { StateType } from '../logic/format-state'

const props = withDefaults(defineProps<{
  data: unknown
  depth: number
}>(), {
  depth: 0,
})
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

const expandedId = ref<string[]>([])
function toggleExpand(id: string) {
  if (expandedId.value.includes(id))
    expandedId.value = expandedId.value.filter((i: string) => i !== id)
  else
    expandedId.value.push(id)
}
</script>

<template>
  <code v-for="(item, index) in list" :key="index" block select-none pl-2 text-sm>
    <p flex items-center :class="[item?.recursive && 'cursor-pointer']" @click="item?.recursive ? toggleExpand(`${depth}-${index}`) : () => {}">
      <VExpandLogo v-if="item?.recursive" :value="expandedId.includes(`${depth}-${index}`)" />
      <i v-else inline-block h-6 w-6 />
      <span text-purple-700 dark:text-purple-300>{{ index }}</span>
      <span px-1 op-60>:</span>
      <span v-if="item?.recursive" :class="rawTypeStyles[item.rawType]" v-html="item?.rawDisplay" />
      <span v-else :class="rawTypeStyles[item.rawType]" v-html="item?.value" />
    </p>
    <VStateType v-if="expandedId.includes(`${depth}-${index}`) && item?.recursive && depth <= 1" :data="item?.value" :depth="depth + 1" />
  </code>
</template>
