import type { Router } from 'vue-router'

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface ComponentInspectorBounds {
  width: number
  height: number
  top: number
  left: number
}
export interface ComponentRelationship {
  id: string
  deps: string[]
  virtual?: boolean
}

export interface ModuleInfo {
  id: string
  plugins: { name: string; transform?: number; resolveId?: number }[]
  deps: string[]
  virtual: boolean
}

export type AssetType = 'image' | 'font' | 'video' | 'audio' | 'text' | 'json' | 'other'

export interface ExecNpmScriptOptions {
  isDev?: boolean
  cwd?: string
  type?: 'install' | 'uninstall'
  callback?: (type: string, data: string) => void
}

export interface AssetInfo {
  path: string
  type: AssetType
  publicPath: string
  filePath: string
  size: number
  mtime: number
}
export interface ImageMeta {
  width: number
  height: number
  orientation?: number
  type?: string
  mimeType?: string
}

declare module 'vite-plugin-devtools/dist/server' {
  export interface ClientFunctions {
    onTerminalData(_: { id?: string; data: string }): void
    onTerminalExit(_: { id?: string; data: string }): void
  }
  export interface ServerFunctions {
    componentGraph(): Promise<ModuleInfo[]>
    inspectClientUrl(): string
    staticAssets(): Promise<AssetInfo[]>
    getImageMeta(path: string): Promise<ImageMeta | undefined>
    getTextAssetContent(path: string): Promise<string | undefined>
    getPackages(): Promise<{ packages: Record<string, Omit<PackageMeta, 'name'>> }>
    getVueSFCList(): Promise<string[]>
    getComponentInfo(filename: string): Promise<Record<string, unknown>>
    installPackage(packages: string[], options?: ExecNpmScriptOptions): Promise<void>
    uninstallPackage(packages: string[], options?: ExecNpmScriptOptions): Promise<void>
    root(): string
  }
}

export interface ModulesList {
  root: string
  modules: ModuleInfo[]
  ssrModules: ModuleInfo[]
}

export type OpenInEditorFn = (filePath: string, line?: number, column?: number) => any

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
  openInEditor: OpenInEditorFn
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

export interface PackageMeta {
  type: string
  version: string
  name: string
}
