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

export interface RPCFunctions {
  componentGraph(): Promise<ModuleInfo[]>
}

export interface ModulesList {
  root: string
  modules: ModuleInfo[]
  ssrModules: ModuleInfo[]
}
