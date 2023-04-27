declare interface performanceTimeline {
  layerId: string
  groupKey: string
  sortId: number
  event: {
    time: number
    title: string
    subtitle: string
    now: number
    data: {
      component: string
      type: string
      measure: string
    }
  }
}

interface Window {
  consola: (...args: any[]) => void
  __VUE_DEVTOOLS_GET_VUE_INSTANCE__: () => any
  __VUE_DEVTOOLS_GET_VUE_APP__: () => any
  __VUE_DEVTOOLS_GET_PERFORMANCE_TIMELINE__: () => performanceTimeline[]
}

declare interface ComponentTreeNode {
  uid: number
  id: string
  name: string
  renderKey: string | number
  inactive: boolean
  isFragment: boolean
  hasChildren: boolean
  children: ComponentTreeNode[]
  domOrder?: number[]
  consoleId?: string
  isRouterView?: boolean
  macthedRouteSegment?: string
  tags: any[]
  autoOpen: boolean
  meta?: any
}
