<script setup lang="ts">
import type { RouteMeta, RouteRecordNormalized } from 'vue-router'
import { tryGetAllMetaKeys } from '~/logic/routes'

const props = defineProps<{
  pages: RouteRecordNormalized[]
  matched: RouteRecordNormalized[]
  matchedPending: RouteRecordNormalized[]
}>()

defineEmits<{
  (e: 'navigate', path: string): void
  (e: 'selectMeta', meta: RouteMeta): void
}>()

const sorted = computed(() => {
  return [...props.pages].sort((a, b) => a.path.localeCompare(b.path))
})

function metaToString(meta: RouteMeta, num: number = 0) {
  const metaStr = JSON.stringify(meta, null, num)
  return metaStr === '{}' ? '-' : metaStr
}

const allMetaKeys = computed(() => tryGetAllMetaKeys(props.pages))

const activeMetaKeys = useStorage<string[]>('__vue-devtools-route-active-meta-keys__', [],
  localStorage,
)

// ensure that activeMetaKeys is always a subset of allMetaKeys
watch(allMetaKeys, (v) => {
  activeMetaKeys.value = activeMetaKeys.value
    .filter(key => v.includes(key))
})

const dynamicTableColumns = computed(() => activeMetaKeys.value.map(key => ({
  head: `meta.${key}`,
  key,
})))

const tableHeadMeta = computed(() => {
  return {
    normal: activeMetaKeys.value ? 2 : 1,
    dynamic: activeMetaKeys.value.length,
  }
})

const normalHead = ['', 'Route Path', 'Name']

const showDynamicSelector = ref(false)
const dynamicSelectorEl = ref<HTMLElement>()
onClickOutside(dynamicSelectorEl, () => {
  showDynamicSelector.value = false
})
</script>

<template>
  <div>
    <table w-full>
      <thead border="b base" text-left leading-8>
        <tr>
          <th v-for="head of normalHead" :key="head" :rowspan="tableHeadMeta.normal">
            {{ head }}
          </th>
          <template v-if="allMetaKeys.length">
            <th :colspan="tableHeadMeta.dynamic">
              <div flex items-center justify-between>
                <span>Route Meta</span>
                <div ref="dynamicSelectorEl" relative>
                  <button text="xs gray-400" relative @click="() => showDynamicSelector = !showDynamicSelector">
                    <i mingcute:filter-fill />
                  </button>
                  <VDDropdown v-model:show="showDynamicSelector" top-40px w-200px :items="allMetaKeys" position="right">
                    <template #item="{ item }">
                      <div flex items-center gap2 truncate p5px font-normal leading-none>
                        <input
                          v-model="activeMetaKeys"
                          cursor-pointer
                          type="checkbox"
                          :value="item"
                        >
                        <span>{{ item }}</span>
                      </div>
                    </template>
                  </VDDropdown>
                </div>
              </div>
            </th>
          </template>
        </tr>
        <tr b="t-1px gray/20">
          <th v-for="{ head, key } of dynamicTableColumns" :key="key">
            {{ head }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item of sorted" :key="item.name"
          class="group" h-7 border="b dashed transparent hover:base" text-left text-sm font-mono
        >
          <td w-20 pr-1>
            <div flex items-center justify-end>
              <VDBadge
                v-if="matched.find(m => m.path === item.path)"
                bg-green-400:10 text-green-400
                title="active"
                v-text="'active'"
              />
              <VDBadge
                v-if="matchedPending.find(m => m.path === item.path)"
                bg-teal-400:10 text-teal-400
                title="next"
                v-text="'next'"
              />
            </div>
          </td>
          <td>
            <div flex="inline gap3" items-center>
              <RoutePathItem
                :route="item"
                :class="matched.find(m => m.path === item.path) ? 'text-primary' : matchedPending.find(m => m.name === item.name) ? 'text-teal' : ''"
                hover="text-primary"
                @navigate="(path:string) => $emit('navigate', path)"
              />
            </div>
          </td>
          <td w-30 ws-nowrap pr-1 op50>
            {{ item.name ?? '-' }}
          </td>
          <template v-if="dynamicTableColumns.length">
            <td v-for="{ key } in dynamicTableColumns " :key="key" truncate ws-nowrap op50>
              {{ item.meta[key]?.toString() ?? '-' }}
            </td>
          </template>
          <td v-else w-50 ws-nowrap pr-1 op50 hover="text-primary op100">
            <span inline-block w-50 cursor-pointer overflow-hidden text-ellipsis :title="metaToString(item.meta, 2)" @click="() => $emit('selectMeta', item.meta)">{{ metaToString(item.meta) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
