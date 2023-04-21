<script setup lang="ts">
defineProps<{
  tab: any
}>()
</script>

<template>
  <VTooltip placement="right">
    <RouterLink
      :to="`/${tab.path}`"
      flex="~"
      hover="bg-active"
      h-10 w-10 select-none items-center justify-center rounded-xl p1 text-secondary
      exact-active-class="!text-primary bg-active"
    >
      <TabIcon
        text-xl
        :icon="tab.icon" :title="tab.title"
      />
    </RouterLink>
    <template #popper>
      <div>
        {{ tab.title }}
      </div>
    </template>
  </VTooltip>
</template>
