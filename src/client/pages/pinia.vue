<script setup lang="ts">
import { reactivePick } from '@vueuse/core'
import { Pane, Splitpanes } from 'splitpanes'
import { piniaGetters, piniaState, piniaStoresId } from '../logic/pinia'

const activeIndex = ref(0)
const omitStoreId = computed(() => {
  return activeIndex.value === 0 ? '' : piniaStoresId.value[activeIndex.value]
})
function select(index: number) {
  activeIndex.value = index
}
const data = computed(() => {
  const state = omitStoreId.value ? reactivePick(toRaw(piniaState.value), omitStoreId.value) : piniaState.value
  const getters = omitStoreId.value ? reactivePick(toRaw(piniaGetters.value), omitStoreId.value) : piniaGetters.value
  const hasState = Object.values(unref(state)).some(item => item !== undefined)
  const hasGetters = Object.values(unref(getters)).some(item => item !== undefined)
  return [
    hasState && {
      key: 'state',
      value: toRaw(state),
    },
    hasGetters && {
      key: 'getters',
      value: toRaw(getters),
    },
  ].filter(Boolean)
})
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <div
            v-for="(item, index) in piniaStoresId"
            :key="index"
            vue-block
            :class="[activeIndex === index ? 'vue-block-active' : 'vue-block-hover']"
            @click="select(index)"
          >
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
