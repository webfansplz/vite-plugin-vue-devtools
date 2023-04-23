<script setup lang="ts">
withDefaults(defineProps<{
  data: any
  depth?: number
}>(), {
  depth: 0,
})
const isExpanded = ref<boolean>(true)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div
    mb-2 cursor-pointer rounded
  >
    <div hover="dark:bg-[#2c3e50] bg-#c2e9d7" flex items-center rounded py-1 text-sm>
      <i
        class="i-material-symbols:arrow-right"
        h-6 w-6 text-5 text-gray-400 dark:text-gray-600
        :class="{
          'transform rotate-90': isExpanded,
        }"
        @click="toggleExpand"
      />
      <!-- <i v-else h-6 w-6 /> -->

      <h3 text="[#7595b5]" font-400>
        {{ data.type }}
      </h3>
    </div>
    <ComponentStateField v-if="isExpanded" :data="data.data" indent-10 />
  </div>
</template>
