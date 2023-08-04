<script setup lang="ts">
import { onKeyDown } from '@vueuse/core'
import Fuse from 'fuse.js'
import { rpc } from '~/logic/rpc'
import { hookApi } from '~/logic/hook'
import { rootPath } from '~/logic/global'

function useAssets() {
  const assets = ref<AssetInfo[]>([])

  getAssets()
  const debounceAssets = useDebounceFn(() => {
    getAssets()
  }, 100)

  async function getAssets() {
    assets.value = await rpc.staticAssets()
  }

  hookApi.hook.on('__vue-devtools:file-watch', ({ event, path }) => {
    if (path.startsWith(rootPath) && ['add', 'unlink'].includes(event))
      debounceAssets()
  })

  return { assets }
}

const { assets } = useAssets()

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

const byTree = computed(() => {
  const root = { path: 'public', children: [] }
  const addToTree = (node: any, pathParts: any, file: AssetInfo) => {
    const [currentPart, ...remainingParts] = pathParts
    let child = node.children.find((child: any) => child.path === currentPart)
    if (!child) {
      child = { ...file, path: currentPart, children: [] }
      node.children.push(child)
    }
    if (remainingParts.length > 1)
      addToTree(child, remainingParts, file)
    else if (remainingParts.length === 1)
      child.children.push({ ...file, path: remainingParts[0] })
  }
  filtered.value.forEach((file) => {
    const pathParts = file.path.split('/').filter(part => part !== '')
    addToTree(root, pathParts, file)
  })
  return root.children
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
            <VDIcon v-if="view === 'grid'" icon="i-carbon-list" />
            <VDIcon v-else icon="i-carbon-grid" />
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
        <VDSectionBlock
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
        </VDSectionBlock>
      </template>
      <div v-else p2 grid="~ cols-minmax-8rem">
        <AssetGridItem v-for="a of filtered" :key="a.path" :asset="a" @click="selected = a" />
      </div>
    </template>
    <div v-else>
      <AssetListItem
        v-for="item, key of byTree" :key="key"
        v-model="selected"
        :item="item"
      />
    </div>
    <DrawerRight
      :model-value="!!selected"
      auto-close w-120
      :navbar="navbar"
      @close="selected = undefined"
    >
      <AssetDetails v-if="selected" v-model="selected" />
    </DrawerRight>
  </div>
  <VDPanelGrids v-else px5>
    <VDCard flex="~ col gap2" min-w-30 items-center p3>
      <h1 text-sm italic op50>
        No Assets
      </h1>
    </VDCard>
  </VDPanelGrids>
</template>
