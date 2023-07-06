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
    vue-block
    :class="[isSelected ? 'vue-block-active' : 'vue-block-hover']"
    @click="select(data.id)"
  >
    <h3 vue-block-title @click="data.hasChildren ? toggleExpand(data.id) : () => {}">
      <VExpandIcon v-if="data.hasChildren" :value="isExpanded" />
      <i v-else inline-block h-6 w-6 />
      <span
        :class="[
          isSelected ? 'vue-tag-symbol-active' : 'vue-tag-symbol',
        ]"
      >&lt;</span>
      <span :class="[isSelected && 'text-white']">
        {{ data.name }}
      </span>
      <span
        :class="[
          isSelected ? 'vue-tag-symbol-active' : 'vue-tag-symbol',
        ]"
      >&gt;</span>
    </h3>
  </div>
  <div v-if="isExpanded && data.hasChildren">
    <ComponentTreeNode v-for="(item) in data.children" :key="item.id" :data="item" :depth="depth + 1" />
  </div>
</template>
