<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: ComponentTreeNode
  depth?: number
}>(), {
  depth: 0,
})

const { isSelected, select, isExpanded, toggleExpand } = useComponent(props.data)
</script>

<template>
  <div
    :style="{
      paddingLeft: `${depth * 15 + 4}px`,
    }"
    max-w="[50%]"
    mb-2 cursor-pointer rounded
    :class="[isSelected ? 'bg-[#3ba776]' : 'hover:dark:bg-[#2c3e50] hover:bg-[#c2e9d7]']"
    @click="select(data.id)"
  >
    <h3 flex items-center py-1 text-sm font-400>
      <i
        v-if="data.hasChildren" class="i-material-symbols:arrow-right"
        h-6 w-6 text-5 text-gray-400 dark:text-gray-600
        :class="{
          'transform rotate-90': isExpanded,
          'text-white': isSelected,
        }"
        @click="toggleExpand(data.id)"
      />
      <i v-else h-6 w-6 />
      <span
        :class="[
          isSelected ? 'text-white/60' : 'text-gray-400 dark:text-gray-600',
        ]"
      >&lt;</span>
      <span :class="[isSelected ? 'text-white' : 'text-#42b983']">
        {{ data.name }}
      </span>
      <span
        :class="[
          isSelected ? 'text-white/60' : 'text-gray-400 dark:text-gray-600',
        ]"
      >&gt;</span>
    </h3>
  </div>
  <div v-if="isExpanded && data.hasChildren">
    <ComponentTreeNode v-for="(item) in data.children" :key="item.id" :data="item" :depth="depth + 1" />
  </div>
</template>
