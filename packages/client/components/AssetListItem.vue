<script setup lang="ts">
const props = withDefaults(defineProps<{
  item: any
  index?: number
  modelValue: AssetInfo | undefined
}>(), {
  index: 0,
})

const emit = defineEmits<{ (...args: any): void }>()
const model = useVModel(props, 'modelValue', emit, { passive: true })

const isCollection = computed(() => props.item?.children?.length)

const open = ref(true)

const icon = computed(() => {
  if (isCollection.value)
    return 'i-carbon-folder'
  const assets = {
    image: 'i-carbon-image',
    video: 'i-carbon-video',
    audio: 'i-carbon-volume-up',
    font: 'i-carbon-text-small-caps',
    text: 'i-carbon-document',
    json: 'i-carbon-json',
  }
  return assets[props.item.type] ?? 'i-carbon-document-blank'
})
</script>

<template>
  <div>
    <button
      flex="~ gap-2" w-full items-center hover="bg-active" px4 py1
      :style="{ paddingLeft: `calc(1rem + ${index * 1.5}em)` }"
      :class="{ 'bg-active': !isCollection && model?.filePath === item?.filePath }"
      @click="isCollection ? open = !open : model = item"
    >
      <div :class="icon" />
      <span :class="{ 'flex items-center': isCollection }" flex-auto text-start text-sm font-mono>
        {{ item.path }}
      </span>
      <VDIcon v-if="isCollection" icon="carbon:chevron-right" :transform-rotate="open ? 90 : 0" transition />
    </button>
    <div x-divider />
    <slot v-if="open">
      <AssetListItem
        v-for="subItem in item?.children"
        :key="subItem.filepath"
        v-model="model"
        :item="subItem"
        :index="index + 1"
      />
    </slot>
  </div>
</template>
