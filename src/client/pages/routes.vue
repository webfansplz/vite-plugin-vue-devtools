<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { activeRouteRecordIndex, activeRouteRecordMatcherState, routeRecordMatcherState, router, toggleRouteRecordMatcher } from '../logic/routes'

onMounted(() => {
  // initRoutes()
})
</script>

<template>
  <div v-if="router" h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <div
            v-for="(item, index) in routeRecordMatcherState"
            :key="index"
            vue-block
            :class="[activeRouteRecordIndex === index ? 'vue-block-active' : 'vue-block-hover']"
            @click="toggleRouteRecordMatcher(index)"
          >
            <h3 vue-block-title>
              <span :class="[activeRouteRecordIndex === index ? 'text-white' : 'vue-block-text']">
                {{ item.path }}
                <VBadge
                  v-for="(tag, childIndex) in item.tags"
                  :key="childIndex" text-black
                  :style="{
                    backgroundColor: `#${tag.bgColor.toString(16)}`,
                  }"
                >
                  {{ tag.label }}
                </VBadge>
              </span>
            </h3>
          </div>
        </div>
      </Pane>
      <Pane>
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields :data="activeRouteRecordMatcherState" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
  <VPanelGrids v-else px5>
    <VCard flex="~ col gap2" min-w-30 items-center p3>
      <TabIcon mb2 text-5xl icon="i-logos-vue" title="Vue Router" />
      <h1 text-xl>
        Install Vue Router
      </h1>
      <p text-sm op50>
        It seems you don't have vue-router installed.
      </p>
    </VCard>
  </VPanelGrids>
</template>
