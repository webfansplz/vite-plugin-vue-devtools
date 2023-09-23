<script setup lang="ts">
import { getSortedTabs } from '~/store'

const groupedTabs = useGroupedTabs()

const { sidebarExpanded } = useDevToolsSettings()

const renderedGroupedTabs = computed(() => {
  return groupedTabs.value.filter(([, { tabs, show }]) => tabs.length && show)
})
</script>

<template>
  <div border="r base" flex="~ col gap-0.5" z-100 h-full w-full items-center bg-base class="no-scrollbar">
    <div sticky top-0 z-1 w-full p1 bg-base border="b base">
      <VDropdown placement="left-start" :distance="20">
        <button
          flex="~ items-center justify-center gap-2"
          hover="bg-active"
          relative h-10 select-none p2 text-secondary
          :class="[
            sidebarExpanded ? 'w-full rounded pl2.5' : '',
          ]"
          title="Vue DevTools"
        >
          <div class="i-logos-vue h-6 w-6" />
          <template v-if="sidebarExpanded">
            <span text="lg white" font-600>
              Vue DevTools
            </span>
            <div flex-auto />
            <div i-carbon-overflow-menu-vertical />
          </template>
        </button>
        <template #popper>
          <DockingPanel />
        </template>
      </VDropdown>

      <div mt-2 h-1px w-full border="b base" />
    </div>

    <div
      flex="~ auto col gap-0.5 items-center" w-full p1 class="no-scrollbar"
      :class="sidebarExpanded ? '' : 'of-x-hidden of-y-auto'"
    >
      <template v-for="[name, { tabs }], idx of renderedGroupedTabs" :key="name">
        <SideNavItem
          v-for="tab of getSortedTabs(tabs)"
          :key="tab.path"
          :tab="tab"
          :minimized="!sidebarExpanded"
        />
        <div v-if="idx !== renderedGroupedTabs.length - 1" my1 h-1px w-full border="b base" />
      </template>
      <div flex-auto />
    </div>

    <div flex="~ none col items-center" :class="{ 'w-full': sidebarExpanded }">
      <div h-1px w-full border="b base" />
      <RouterLink
        replace
        to="/settings"
        :flex="`~ items-center ${!sidebarExpanded ? 'justify-center' : 'justify-start'}`"
        :w="!sidebarExpanded ? '10' : 'full'"
        :rounded="!sidebarExpanded ? 'xl' : ''"
        :p="!sidebarExpanded ? '1' : 'x3'"
        hover="bg-active"
        relative my1 block h-10 w-10 select-none rounded-xl p1 text-secondary
        exact-active-class="!text-primary bg-active"
      >
        <TabIcon
          text-xl
          icon="i-carbon-settings" title="Settings" :show-title="false"
        />
        <span v-if="sidebarExpanded" ml-2 overflow-hidden text-ellipsis ws-nowrap>
          Settings
        </span>
      </RouterLink>
    </div>
  </div>
</template>
