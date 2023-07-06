<script setup lang="ts">
import { useFuse } from '@vueuse/integrations/useFuse'
import { rpc } from '../logic/rpc'
import type { DocumentInfo } from '../../types'
import { data } from '../logic/documentations'

const rawItems = data
const items = ref(data)
const iframeViewUrl = ref('')
let packagesName

rpc.getPackages().then((res) => {
  packagesName = Object.keys(res.packages)
  items.value = rawItems.filter(item => packagesName.includes(item.id))
})

function navigate(data: DocumentInfo) {
  if (data.openInBlank)
    window.open(data.website, '_blank')
  else
    iframeViewUrl.value = data.website
}

const keywords = ref('')
const { results: filterDocuments } = useFuse(keywords, rawItems.map(i => i.name), {
  matchAllWhenSearchEmpty: true,
})

watch(filterDocuments, () => {
  items.value = rawItems.filter(item => (filterDocuments.value.map(i => i.item).includes(item.name) && packagesName.includes(item.id)))
})

function back() {
  iframeViewUrl.value = ''
}
</script>

<template>
  <div class="overflow-y-scroll">
    <div border="b base" flex="~ col gap1" px4 py3 navbar-glass>
      <VTextInput v-model="keywords" font-mono icon="carbon:search" placeholder="Filter Documentations" op50 />
    </div>
    <div v-if="iframeViewUrl">
      <IframeView :src="iframeViewUrl" />
      <teleport to="body">
        <span
          fixed left-2 top-2 z-1000 h-8 w-8 flex cursor-pointer select-none items-center justify-center rounded-5
          bg-base hover="text-primary" @click.prevent.stop="back"
        >
          <i tabler:arrow-back-up />
        </span>
      </teleport>
    </div>
    <div v-else grid grid-cols-minmax-400px h-screen select-none gap3 overflow-scroll p4 class="no-scrollbar">
      <DocDetails v-for="(item, index) in items" :key="index" :data="item" @navigate="navigate" />
    </div>
  </div>
</template>
