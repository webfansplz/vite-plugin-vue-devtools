<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import {
  activeLayerId,
  activeTimelineEventIndex,
  activeTimelineEvents,
  timelineEventDetails,
  timelineLayer,
  toggleTimelineEventIndex,
  toggleTimelineLayer,
} from '../logic/timeline'

// updatePerformanceTimeline()
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base" size="20">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <div
            v-for="(item) in timelineLayer"
            :key="item.id"
            vue-block
            :class="[activeLayerId === item.id ? 'vue-block-active' : 'vue-block-hover']"
            @click="toggleTimelineLayer(item.id)"
          >
            <h3 vue-block-title>
              <span truncate :class="[activeLayerId === item.id && 'text-white']">
                {{ item.label }}
              </span>
            </h3>
          </div>
        </div>
      </Pane>
      <Pane border="r base" size="45">
        <div h-screen select-none overflow-scroll class="no-scrollbar">
          <TimelineEvent :data="activeTimelineEvents" :selected="activeTimelineEventIndex" @update-selected="toggleTimelineEventIndex" />
        </div>
      </Pane>
      <Pane v-if="timelineEventDetails.value" size="35">
        <div h-screen select-none overflow-scroll p-2 class="no-scrollbar">
          <StateFields :data="timelineEventDetails" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
