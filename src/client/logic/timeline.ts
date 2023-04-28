interface TimelineLayer {
  id: string
  label: string
}

interface TimelineEvent {
  layerId: string
  groupKey?: string
  sortId?: number
  event: {
    time: number
    title: string
    subtitle: string
    now: number
    data: Record<string, unknown>
  }
}

export const timelineLayer = ref<TimelineLayer[]>([])
export const timelineEvent = ref<TimelineEvent[]>([])
export const activeLayerId = ref('performance')
export const activeTimelineEvents = computed(() => {
  return timelineEvent.value.filter(item => item.layerId === activeLayerId.value)
})

export const activeTimelineEventIndex = ref(0)

export function toggleTimelineLayer(id: string) {
  activeLayerId.value = id
  activeTimelineEventIndex.value = 0
}

export const timelineApi = {
  addTimelineLayer(layer: TimelineLayer) {
    timelineLayer.value.push(layer)
  },
  addTimelineEvent(event: TimelineEvent) {
    timelineEvent.value.push(event)
  },
}

export function toggleTimelineEventIndex(index: number) {
  activeTimelineEventIndex.value = index
}

export const timelineEventDetails = computed(() => {
  return {
    key: 'event info',
    value: activeTimelineEvents.value[activeTimelineEventIndex.value]?.event.data,
  }
})

export function initTimeline() {
  function update() {
    const data = window.parent.__VUE_DEVTOOLS_GET_PERFORMANCE_TIMELINE__()
    data.forEach((item) => {
      timelineApi.addTimelineEvent(item)
    })
  }
  timelineApi.addTimelineLayer({
    id: 'performance',
    label: 'Performance',
  })
  update()
  setInterval(() => {
    timelineEvent.value = timelineEvent.value.filter(item => item.layerId !== 'performance')
    update()
  }, 1000)
}
