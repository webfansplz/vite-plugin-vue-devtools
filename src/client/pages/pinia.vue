<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { piniaGetters, piniaState, piniaStoresCategory } from '../logic/pinia'

const activeIndex = ref(0)
const pickStoreId = computed(() => {
  return activeIndex.value === 0 ? '' : piniaStoresCategory.value[activeIndex.value]
})
function select(index: number) {
  activeIndex.value = index
}

const data = computed(() => {
  const state = pickStoreId.value ? pick(toRaw(piniaState.value), [pickStoreId.value]) : piniaState.value
  const getters = pickStoreId.value ? pick(toRaw(piniaGetters.value), [pickStoreId.value]) : piniaGetters.value
  const hasState = Object.values(unref(state)).some(item => item !== undefined)
  const hasGetters = Object.values(unref(getters)).some(item => item !== undefined)
  return [
    hasState && {
      key: 'state',
      value: unref(state),
    },
    hasGetters && {
      key: 'getters',
      value: unref(getters),
    },
  ].filter(Boolean)
})
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base" :size="40">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <div
            v-for="(item, index) in piniaStoresCategory" :key="index" vue-block
            :class="[activeIndex === index ? 'vue-block-active' : 'vue-block-hover']" @click="select(index)"
          >
            <h3 vue-block-title>
              <span :class="[activeIndex === index && 'text-white']">
                {{ item }}
              </span>
            </h3>
          </div>
        </div>
      </Pane>
      <Pane :size="60">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields v-for="(item, index) in data" :id="index" :key="index" :data="item" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
