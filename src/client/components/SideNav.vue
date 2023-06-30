<script setup lang="ts">
import { getSortedTabs } from '../store'

const groupedTabs = useGroupedTabs()
</script>

<template>
  <div border="r base" flex="~ col gap-0.5" z-100 h-full items-center bg-base class="no-scrollbar">
    <div flex="~ col" sticky top-0 z-1 mb1 items-center pt3 bg-base>
      <VDropdown placement="left-start" :distance="20">
        <button
          i-logos-vue h-6 w-6 text-lg
          title="Vue DevTools"
        />
        <template #popper>
          <DockingPanel />
        </template>
      </VDropdown>

      <div mt-2 h-1px w-8 border="b base" />
    </div>

    <div flex="~ auto col gap-0.5 items-center" of-auto class="no-scrollbar" py1>
      <template v-for="[name, { tabs, show }], idx of groupedTabs" :key="name">
        <template v-if="tabs.length && show">
          <div v-if="idx" my1 h-1px w-8 border="b base" />
          <SideNavItem
            v-for="tab of getSortedTabs(tabs)"
            :key="tab.path"
            :tab="tab"
          />
        </template>
      </template>
      <div flex-auto />
    </div>

    <div flex="~ none col items-center">
      <div h-1px w-8 border="b base" />
      <RouterLink
        replace
        to="/settings"
        flex="~ items-center justify-center"
        hover="bg-active"
        relative my1 block h-10 w-10 select-none rounded-xl p1 text-secondary
        exact-active-class="!text-primary bg-active"
      >
        <TabIcon
          text-xl
          icon="i-carbon-settings" title="Settings" :show-title="false"
        />
      </RouterLink>
    </div>
  </div>
</template>
