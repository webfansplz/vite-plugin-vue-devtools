<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'

const timelineInfo = ref<any[]>([])
let timer: number | null
const selected = ref(0)
const timelineEventInfo = computed(() => {
  return timelineInfo.value[selected.value].event.data
})
onMounted(() => {
  timer = window.setInterval(() => {
    timelineInfo.value = window.parent.__VUE_DEVTOOLS_GET_TIMELINE_EVENT__()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer!)
})

function updateSelected(index: number) {
  selected.value = index
}
</script>

<template>
  <div h-screen n-panel-grids>
    <Splitpanes>
      <Pane border="r base">
        <div h-screen select-none overflow-scroll>
          <TimelineEvent :data="timelineInfo" :selected="selected" @update-selected="updateSelected" />
        </div>
      </Pane>
      <Pane>
        <div h-screen select-none overflow-scroll p-2>
          <TimelineEventInfo :data="timelineEventInfo" />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
