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

export interface RPCFunctions {
  componentGraph(): Promise<ModuleInfo[]>
  inspectClientUrl(): Promise<string>
  staticAssets(): Promise<AssetInfo[]>
  getImageMeta(path: string): Promise<ImageMeta>
  getTextAssetContent(path: string): Promise<string>
}

export interface ModulesList {
  root: string
  modules: ModuleInfo[]
  ssrModules: ModuleInfo[]
}
