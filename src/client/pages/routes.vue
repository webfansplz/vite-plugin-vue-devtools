<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { activeRouteRecordIndex, activeRouteRecordMatcherState, initRoutes, routeRecordMatcherState, toggleRouteRecordMatcher } from '../logic/routes'

onMounted(() => {
  initRoutes()
})
</script>

<template>
  <div h-screen>
    <Splitpanes>
      <Pane border="r base">
        <div h-screen select-none overflow-scroll p-2>
          <div
            v-for="(item, index) in routeRecordMatcherState"
            :key="index"
            mb-2 max-w-100 cursor-pointer rounded
            :class="[activeRouteRecordIndex === index ? 'vue-block-active' : 'vue-block-hover']"
            @click="toggleRouteRecordMatcher(index)"
          >
            <h3 flex items-center py-1 pl-2 text-sm font-400>
              <span :class="[activeRouteRecordIndex === index ? 'text-white' : 'vue-block']">
                {{ item.path }}
                <VBadge
                  v-for="(tag, childIndex) in item.tags"
                  :key="childIndex" text-white
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
        <div h-screen select-none overflow-scroll p-2>
          <VState :data="activeRouteRecordMatcherState" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
