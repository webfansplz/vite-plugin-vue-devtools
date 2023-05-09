<script lang="ts">
const expandedIdCache = ref<string[]>([])
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    data: { key: string; value: Record<string, unknown> }
    id?: number
  }>(),
  {
    id: 0,
  })

const isExpanded = ref<boolean>(true)

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function updateExpandedIdCache(id: string) {
  if (expandedIdCache.value.includes(id))
    expandedIdCache.value = expandedIdCache.value.filter((i: string) => i !== id)
  else
    expandedIdCache.value.push(id)
}
</script>

<template>
  <div>
    <h3
      flex cursor-pointer items-center rounded py-1 class="hover:bg-[#c2e9d7] hover:dark:bg-[#2c3e50]"
      @click="toggleExpanded"
    >
      <VExpandIcon :value="isExpanded" />
      <span text-primary>
        {{ data.key }}
      </span>
    </h3>
    <div v-show="isExpanded" pl-3>
      <StateFieldsTree
        :id="id" :data="data.value" :expanded-id="expandedIdCache"
        @update-expanded="updateExpandedIdCache"
      />
    </div>
  </div>
</template>
