import type { Router } from 'vue-router'

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface ComponentInspectorBounds {
  width: number
  height: number
  top: number
  left: number
}

export interface VueDevtoolsHostClient {
  markClientLoaded: () => void
  panel?: {
    toggleViewMode: (mode?: 'xs' | 'default') => void
    popup: () => void
    toggle: () => void
  }
  hook: {
    events: Map<string, () => void>
    emit: (event: string, ...payload: any[]) => void
    on: (event: string, fn: (...payload: any[]) => void) => void
  }
  hookBuffer: [string, Record<string, any>][]
  categorizedHookBuffer: Record<string, [string, Record<string, any>][]>
  openInEditor: (filePath: string, line?: number, column?: number) => void
  componentInspector: {
    highlight: (_name: string, _bounds: ComponentInspectorBounds) => void
    unHighlight: () => void
    scrollToComponent: (_bounds: ComponentInspectorBounds) => void
  }
}

export type BuiltinTabGroup = 'app' | 'modules' | 'advanced'
export type AllTabGroup = BuiltinTabGroup | 'ungrouped'

export interface Tab {
  event?: (client: VueDevtoolsHostClient, router: Router) => void
  path?: string
  // temporal use title as unique id
  title: string
  icon: string
  // use by settings, show/hide tab
  disabled: boolean
  // use by group
  group: AllTabGroup
  groupIndex: number
}

export type BuiltinTab = WithOptional<Tab, 'group' | 'groupIndex' | 'disabled'>
export interface DocumentInfo {
  id: string
  name: string
  description: string
  website: string
  github: string
  icon: string
  tips: string
  openInBlank: boolean
}

export interface PackageInfo {
  name: string
  version: string
  descriptions: string
  owner: {
    name: string
    link: string
  }
  repository: {
    url: string
  }
  humanDownloadsLast30Days: string
  versions: string[]
  author: string
  downloads: string
  versionIndex: number
  activeVersion: string
  repoLink: string
  authorLink: string
}
