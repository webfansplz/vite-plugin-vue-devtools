<script setup lang="ts">
defineProps<{
  data: { key: string; value: Record<string, unknown> }
}>()
const isExpanded = ref<boolean>(true)
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div>
    <h3
      flex cursor-pointer items-center rounded py-1
      class="hover:bg-[#c2e9d7] hover:dark:bg-[#2c3e50]"
      @click="toggleExpanded"
    >
      <VExpandLogo :value="isExpanded" />
      <span text-primary>
        {{ data.key }}
      </span>
    </h3>
    <div v-if="isExpanded" pl-3>
      <VStateType :data="data.value" />
    </div>
  </div>
</template>
