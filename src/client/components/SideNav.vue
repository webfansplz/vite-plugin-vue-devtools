<script setup lang="ts">
import Sortable from 'sortablejs/modular/sortable.core.esm.js'
import type { BuiltinTab } from '../../types'

const categories = useCategorizedTabs()
const sortList = reactive<HTMLElement[]>([])

watch(categories, () => {
  console.log(categories.value)
})

function initGroups() {
  const len = categories.value.length
  const MappingKeys = {
    0: 'app',
    1: 'modules',
    2: 'advanced',
  }

  const wrap = (evt, i: number, isAdd: boolean) => {
    const dataKey = (evt.item as HTMLElement).getAttribute('data-key')?.split('-')
    const newList = categories.value[i][1]
    const oldList = isAdd ? categories.value[Object.keys(MappingKeys).find(key => MappingKeys[key] === dataKey![0])!][1] : newList

    const innerMove = {
      categories: categories.value,
    }

    const old = (oldList.splice(evt.oldIndex, 1)[0] as BuiltinTab)

    newList.splice(evt.newIndex, 0, old)
    old.category = MappingKeys[i]

    useSortCategories(innerMove);

    (evt.item as HTMLElement).setAttribute('data-key', `${old.category}-${old.key}`)
  }

  for (let i = 0; i < len; i++) {
    new Sortable(document.querySelector(`.sortEl${i}`), {
      group: 'shared',
      onAdd(evt) {
        wrap(evt, i, true)
      },
      onUpdate(evt) {
        wrap(evt, i, false)
      },
    })
  }
}
onMounted(() => {
  initGroups()
})
</script>

<template>
  <div border="r base" flex="~ col gap-0.5" z-100 h-full items-center bg-base class="no-scrollbar">
    <div flex="~ col" sticky top-0 z-1 mb1 items-center pt3 bg-base>
      <VDropdown placement="left-start" :distance="20">
        <button i-logos-vue h-6 w-6 text-lg title="Vue DevTools" />
        <template #popper>
          <DockingPanel />
        </template>
      </VDropdown>

      <div mt-2 h-1px w-8 border="b base" />
    </div>

    <div flex="~ auto col gap-0.5 items-center" of-auto class="no-scrollbar" py1>
      <template v-for="[name, tabs], idx of categories" :key="name">
        <div v-if="idx" my1 h-1px w-8 border="b base" />
        <div
          :ref="(el) => {
            sortList[idx] = el as HTMLElement
          }" :class="[`sortEl${idx}`]"
        >
          <div v-for="tab of tabs" :key="tab.key" :data-key="`${name}-${tab.key}`">
            <SideNavItem v-show="!tab.hidden" :tab="tab" />
          </div>
        </div>
      </template>
      <div flex-auto />
    </div>

    <div flex="~ none col items-center">
      <div h-1px w-8 border="b base" />
      <RouterLink
        replace to="/settings" flex="~ items-center justify-center" hover="bg-active" relative my1 block h-10
        w-10 select-none rounded-xl p1 text-secondary exact-active-class="!text-primary bg-active"
      >
        <TabIcon text-xl icon="i-carbon-settings" title="Settings" :show-title="false" />
      </RouterLink>
    </div>
  </div>
</template>
