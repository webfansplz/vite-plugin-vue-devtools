<script setup lang="ts">
import type { DocumentInfo } from '~/types'
import { data } from '~/logic/documentations'

const iframeViewUrl = ref('')

function navigate(data: DocumentInfo) {
  if (data.openInBlank)
    window.open(data.website, '_blank')
  else
    iframeViewUrl.value = data.website
}

function back() {
  iframeViewUrl.value = ''
}
</script>

<template>
  <div v-if="iframeViewUrl" relative h-screen>
    <IframeView :src="iframeViewUrl" />
    <teleport to="body">
      <span

        fixed left-2 top-2 z-1000 h-8 w-8 flex cursor-pointer select-none items-center justify-center rounded-5 bg-base hover="text-primary" @click.prevent.stop="back"
      >
        <i tabler:arrow-back-up />
      </span>
    </teleport>
  </div>
  <div v-else grid grid-cols-minmax-400px h-screen select-none gap3 overflow-scroll p4 class="no-scrollbar">
    <DocDetails v-for="(item, index) in data" :key="index" :data="item" @navigate="navigate" />
  </div>
</template>
