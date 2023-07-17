<script setup lang="ts">
import { currentRoute, router, routes } from '~/logic/app'

const routeInput = ref('')

onMounted(() => {
  routeInput.value = currentRoute.value?.path ?? '/'
})

const routeInputMatched = computed(() => {
  if (routeInput.value === currentRoute.value?.path)
    return []
  return router.value?.resolve({
    path: routeInput.value || '/',
  }).matched ?? []
})

function navigate() {
  if (routeInput.value === currentRoute.value?.path)
    return
  router.value?.push(routeInput.value || '/')
}

function navigateToRoute(path: string) {
  router.value?.push(path)
  routeInput.value = path
}
</script>

<template>
  <div h-full of-auto n-panel-grids>
    <div border="b base" flex="~ col gap1" px4 py3 navbar-glass>
      <div>
        <template v-if="currentRoute?.path !== routeInput">
          <span op50>Navigate from </span>
          <span font-mono>{{ currentRoute?.path }}</span>
          <span op50> to </span>
        </template>
        <template v-else>
          <span op50>Current route</span>
        </template>
      </div>
      <VDTextInput
        v-model="routeInput"
        font-mono
        icon="carbon-direction-right-01 scale-y--100"
        :class="currentRoute?.path === routeInput ? '' : routeInputMatched.length ? 'text-green' : 'text-orange' "
        @keydown.enter="navigate"
      />
      <div>
        <template v-if="currentRoute?.path !== routeInput">
          <span>Press <b font-bold>Enter</b> to navigate</span>
          <span v-if="!routeInputMatched.length" text-orange op75> (no match)</span>
        </template>
        <template v-else>
          <span op50>Edit path above to navigate</span>
        </template>
      </div>
    </div>
    <VDSectionBlock
      icon="carbon-tree-view-alt"
      text="All Routes"
      :description="`${routes.length} routes registered in your application`"
      padding="pr5"
    >
      <RoutesTable
        :pages="routes"
        :matched="currentRoute?.matched ?? []"
        :matched-pending="routeInputMatched"
        @navigate="navigateToRoute"
      />
    </VDSectionBlock>
  </div>
</template>
