export interface RPCFunctions {
  componentGraph(): Promise<{
    id: string
    deps: string[]
  }[]>
}
