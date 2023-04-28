<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { activeRouteRecordIndex, activeRouteRecordMatcherState, routeRecordMatcherState, toggleRouteRecordMatcher } from '../logic/routes'

onMounted(() => {
  // initRoutes()
})
</script>

<template>
  <div h-screen>
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
          <VState :data="activeRouteRecordMatcherState" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
