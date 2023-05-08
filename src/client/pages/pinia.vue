<script setup lang="ts">
import { reactivePick } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { piniaGetters, piniaState, piniaStoresCategory } from '../logic/pinia'

const activeIndex = ref(0)
const pickStoreId = computed(() => {
  return activeIndex.value === 0 ? '' : piniaStoresCategory.value[activeIndex.value]
})
function select(index: number) {
  activeIndex.value = index
}
const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): T => keys.reduce((pre: T, cur: K) => (cur in obj && (pre[cur] = obj[cur]), pre), <T>({}))

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
      <Pane border="r base">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <div v-for="(item, index) in piniaStoresCategory" :key="index" vue-block
            :class="[activeIndex === index ? 'vue-block-active' : 'vue-block-hover']" @click="select(index)">
            <h3 vue-block-title>
              <span :class="[activeIndex === index ? 'text-white' : 'vue-block-text']">
                {{ item }}
              </span>
            </h3>
          </div>
        </div>
      </Pane>
      <Pane>
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields v-for="(item, index) in data" :id="index" :key="index" :data="item" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
