<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import Fuse from 'fuse.js'
import { rpc } from '~/logic/rpc'

const assets = ref<AssetInfo[]>([])

async function getAssets() {
  assets.value = await rpc.staticAssets()
}

getAssets()

const search = ref('')

const fuse = computed(() => new Fuse(assets.value || [], {
  keys: [
    'path',
  ],
}))

const filtered = computed(() => {
  const result = search.value
    ? fuse.value.search(search.value).map(i => i.item)
    : (assets.value || [])
  return result
})

const byFolders = computed(() => {
  const result: Record<string, AssetInfo[]> = {}
  for (const asset of filtered.value) {
    const folder = `${asset.path.split('/').slice(0, -1).join('/')}/`
    if (!result[folder])
      result[folder] = []
    result[folder].push(asset)
  }
  return Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
})

const selected = ref<AssetInfo>()

const view = ref<'list' | 'grid'>('grid')

function toggleView() {
  view.value = view.value === 'list' ? 'grid' : 'list'
}

onKeyDown('Escape', () => {
  selected.value = undefined
})

const navbar = ref<HTMLElement>()
</script>

<template>
  <div v-if="assets?.length" h-full of-auto n-panel-grids>
    <Navbar ref="navbar" v-model:search="search" pb2>
      <template #actions>
        <div flex-none flex="~ gap4">
          <button
            title="Toggle view"
            @click="toggleView"
          >
            <VIcon v-if="view === 'grid'" icon="i-carbon-list" />
            <VIcon v-else icon="i-carbon-grid" />
          </button>
        </div>
      </template>
      <div op50>
        <span v-if="search">{{ filtered.length }} matched · </span>
        <span>{{ assets?.length }} assets in total</span>
      </div>
    </Navbar>

    <template v-if="view === 'grid'">
      <template v-if="byFolders.length > 1">
        <VSectionBlock
          v-for="[folder, items] of byFolders"
          :key="folder"
          :text="folder"
          :description="`${items.length} items`"
          :open="items.length <= 20"
          :padding="false"
        >
          <div mt--4 px2 grid="~ cols-minmax-8rem">
            <AssetGridItem v-for="a of items" :key="a.path" :asset="a" :folder="folder" @click="selected = a" />
          </div>
        </VSectionBlock>
      </template>
      <div v-else p2 grid="~ cols-minmax-8rem">
        <AssetGridItem v-for="a of filtered" :key="a.path" :asset="a" @click="selected = a" />
      </div>
    </template>
    <div v-else>
      <AssetListItem v-for="a of filtered" :key="a.path" :asset="a" @click="selected = a" />
    </div>
    <DrawerRight
      :model-value="!!selected"
      auto-close w-120
      :navbar="navbar"
      @close="selected = undefined"
    >
      <AssetDetails v-if="selected" :asset="selected" />
    </DrawerRight>
  </div>
  <VPanelGrids v-else px5>
    <VCard flex="~ col gap2" min-w-30 items-center p3>
      <h1 text-sm italic op50>
        No Assets
      </h1>
    </VCard>
  </VPanelGrids>
</template>
