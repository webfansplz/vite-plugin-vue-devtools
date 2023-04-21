<script setup lang="ts">
const route = useRoute()
const isRoot = computed(() => route.path === '/')
onMounted(() => {
})
const isUtilityView = false
</script>

<template>
  <div fixed inset-0 h-screen w-screen>
    <div
      :grid="isUtilityView ? 'flex' : '~ cols-[50px_1fr]'"
      h-full h-screen of-hidden font-sans bg-base
    >
      <SideNav v-show="!isUtilityView" of-x-hidden of-y-auto />
      <RouteView />
    </div>
  </div>
</template>
