declare interface PerformanceTimeline {
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
  __VUE_DEVTOOLS_GET_PERFORMANCE_TIMELINE__: () => PerformanceTimeline[]
  __VUE_DEVTOOLS_GLOBAL_HOOK__: any
  __VUE_DEVTOOLS_IS_POPUP__: boolean
  __VUE_DEVTOOLS_VIEW__: Record<'setClient', unknown>
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
