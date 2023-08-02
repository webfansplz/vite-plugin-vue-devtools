<script setup lang="ts">
import type { RouteMeta, RouteRecordNormalized } from 'vue-router'

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
</script>

<template>
  <div>
    <table w-full>
      <thead border="b base">
        <tr>
          <th text-left />
          <th text-left>
            Route Path
          </th>
          <th text-left>
            Name
          </th>
          <th text-left>
            Route Meta
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item of sorted" :key="item.name" class="group" h-7 border="b dashed transparent hover:base">
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
          <td text-sm>
            <div flex="inline gap3" items-center>
              <RoutePathItem
                :route="item"
                :class="matched.find(m => m.path === item.path) ? 'text-primary' : matchedPending.find(m => m.name === item.name) ? 'text-teal' : ''"
                @navigate="(path:string) => $emit('navigate', path)"
              />
            </div>
          </td>
          <td w-30 ws-nowrap pr-1 text-left text-sm font-mono op50>
            {{ item.name ?? '-' }}
          </td>
          <td w-50 ws-nowrap pr-1 text-left text-sm font-mono op50>
            <span inline-block w-50 cursor-pointer overflow-hidden text-ellipsis :title="metaToString(item.meta, 2)" @click="() => $emit('selectMeta', item.meta)">{{ metaToString(item.meta) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
