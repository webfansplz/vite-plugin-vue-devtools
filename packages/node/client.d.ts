declare type AssetType = 'image' | 'font' | 'video' | 'audio' | 'text' | 'json' | 'other'

declare interface AssetInfo {
  path: string
  type: AssetType
  publicPath: string
  filePath: string
  size: number
  mtime: number
}
declare interface ImageMeta {
  width: number
  height: number
  orientation?: number
  type?: string
  mimeType?: string
}

declare interface ModuleInfo {
  id: string
  plugins: { name: string; transform?: number; resolveId?: number }[]
  deps: string[]
  virtual: boolean
}

declare interface ExecNpmScriptOptions {
  isDev?: boolean
  cwd?: string
  type?: 'install' | 'uninstall'
  callback?: (type: string, data: string) => void
}


declare interface RPCFunctions {
  componentGraph(): Promise<ModuleInfo[]>
  inspectClientUrl(): string
  staticAssets(): Promise<AssetInfo[]>
  getImageMeta(path: string): Promise<ImageMeta | undefined>
  getTextAssetContent(path: string): Promise<string | undefined>
  getPackages(): Promise<Record<string, Omit<PackageMeta, 'name'>>>
  getVueSFCList(): Promise<string[]>
  getComponentInfo(filename: string): Promise<Record<string, unknown>>
  onTerminalData(_: { id?: string; data: string }): void
  onTerminalExit(_: { id?: string; data?: string }): void
  installPackage(packages: string[], options?: ExecNpmScriptOptions): Promise<void>
  uninstallPackage(packages: string[], options?: ExecNpmScriptOptions): Promise<void>
  root(): string
}


declare interface PackageMeta {
  type: string
  version: string
  name: string
}
