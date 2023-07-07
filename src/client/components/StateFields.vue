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
const copy = useCopy()
const showNotification = useNotification()

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function updateExpandedIdCache(id: string) {
  if (expandedIdCache.value.includes(id))
    expandedIdCache.value = expandedIdCache.value.filter((i: string) => i !== id)
  else
    expandedIdCache.value.push(id)
}

function copyContent(value: Record<string, unknown>) {
  try {
    copy(JSON.stringify(value))
  }
  catch (e: any) {
    showNotification(
      {
        text: e.message,
        type: 'error',
        icon: 'carbon-close-outline',
        duration: 5000,
      },
    )
  }
}
</script>

<template>
  <div>
    <h3
      flex cursor-pointer items-center justify-between rounded py-1 class="hover:bg-[#c2e9d7] hover:dark:bg-[#2c3e50]"
      @click="toggleExpanded"
    >
      <div>
        <VExpandIcon :value="isExpanded" />
        <span text-primary>
          {{ data.key }}
        </span>
      </div>
      <VIconButton
        mr2
        flex-none
        :title="`Copy ${data.key} to clipboard`"
        icon="carbon-copy"
        @click.stop="copyContent(data.value)"
      />
    </h3>
    <div v-show="isExpanded" pl-3>
      <StateFieldsTree
        :id="id" :data="data.value" :expanded-id="expandedIdCache"
        @update-expanded="updateExpandedIdCache"
      />
    </div>
  </div>
</template>
