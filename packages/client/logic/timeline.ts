import { nanoid } from 'nanoid'
import { getComponentFileName } from './components/util'
import { useDevToolsClient } from './client'

interface TimelineLayer {
  id: string
  label: string
}

interface TimelineEvent {
  layerId: string
  groupKey?: string
  sortId?: number
  id?: number
  event: {
    time: number
    title: string
    subtitle: string
    now: number
    data: Record<string, any>
  }
}

export const timelineLayer = ref<TimelineLayer[]>([])
export const timelineEvent = ref<TimelineEvent[]>([])
export const activeLayerId = ref('router')
export const activeTimelineEvents = computed(() => {
  return timelineEvent.value.map(item => ({ ...item, id: nanoid() })).filter(item => item.layerId === activeLayerId.value)
})

export const activeTimelineEventIndex = ref(0)

export function toggleTimelineLayer(id: string) {
  activeLayerId.value = id
  activeTimelineEventIndex.value = 0
}

export const timelineApi = {
  removeTimelineLayer(layerId: string) {
    timelineLayer.value = timelineLayer.value.filter(layer => layer.id !== layerId)
  },
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

function addTimelineEvent(event: [string, Record<string, any>]) {
  const [eventType, {
    now, _, uid, component, type, time, sortId,
  }] = event
  const filename = component.type.__name ?? component.type.name ?? getComponentFileName(component.type)
  if (!filename)
    return
  const item = timelineEvent.value.slice(0).reverse().find(item => item.groupKey === `${uid}-${type}`)
  timelineApi.addTimelineEvent({
    layerId: 'performance',
    groupKey: `${uid}-${type}`,
    sortId,
    event: {
      title: filename,
      subtitle: type,
      time,
      now,
      data: {
        component: filename,
        // name,
        type,
        measure: eventType === 'perf:start' ? 'start' : 'end',
        ...(eventType === 'perf:end'
          ? { duration: `${time - (item?.event?.time ?? 0)}ms` }
          : {}),
      },
    },
  })
}

export function initPerfTimeline(events: [string, Record<string, any>][]) {
  const performTimelineSortKey = {
    start: -1,
    end: 1,
  }
  timelineApi.addTimelineLayer({
    id: 'performance',
    label: 'Performance',
  })
  events.forEach((event) => {
    addTimelineEvent(event)
  })

  timelineEvent.value
    = timelineEvent.value.sort((a, b) => a.sortId! - b.sortId!).sort((a, b) => performTimelineSortKey[a.event.data.measure] - performTimelineSortKey[b.event.data.measure])

  const client = useDevToolsClient()
  let sortId = timelineEvent.value.length
  client.value?.hook?.on('perf:start', (app, uid, component, type, time) => {
    if (component?.root.type?.devtools?.hide)
      return
    addTimelineEvent(['perf:start', {
      now: Date.now(),
      app,
      uid,
      component,
      type,
      time,
      sortId: sortId++,
    }])
  })
  client.value?.hook?.on('perf:end', (app, uid, component, type, time) => {
    if (component?.root.type?.devtools?.hide)
      return
    addTimelineEvent(['perf:end', {
      now: Date.now(),
      app,
      uid,
      component,
      type,
      time,
      sortId: sortId++,
    }])
  })
}
