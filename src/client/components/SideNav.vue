<script setup lang="ts">
// const tabs = useTabs()
const tabs = [
  {
    path: 'components',
    title: 'Components',
    icon: 'i-carbon-assembly-cluster',
  },
  {
    path: 'timeline',
    title: 'Timeline',
    icon: 'i-icon-park-outline:vertical-timeline',
  },
  {
    path: 'graph',
    title: 'Graph',
    icon: 'i-carbon-network-4',
  },
  {
    path: 'inspect',
    title: 'Inspect',
    icon: 'i-carbon-ibm-watson-discovery',
  },
  {
    path: 'inspector',
    title: 'Inspector',
    icon: 'i-carbon-select-window',
  },
]
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
          <!-- TODO: Menu -->
          Menu
        </template>
      </VDropdown>

      <div mt-2 h-1px w-8 border="b base" />
    </div>

    <SideNavItem
      v-for="tab of tabs"
      :key="tab.path"
      :tab="tab"
    />
  </div>
</template>
