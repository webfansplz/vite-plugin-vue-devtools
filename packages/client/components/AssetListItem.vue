<script setup lang="ts">
const props = defineProps<{
  asset: AssetInfo
}>()

const icon = computed(() => {
  const assets = {
    image: 'i-carbon-image',
    video: 'i-carbon-video',
    audio: 'i-carbon-volume-up',
    font: 'i-carbon-text-small-caps',
    text: 'i-carbon-document',
    json: 'i-carbon-json',
  }
  return assets[props.asset.type] ?? 'i-carbon-document-blank'
})
</script>

<template>
  <button flex="~ gap-1" w-full items-center hover="bg-active" rounded px4 py2>
    <div :class="icon" />
    <div of-hidden truncate ws-nowrap text-center>
      {{ asset.path }}
    </div>
  </button>
</template>
