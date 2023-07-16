import type { WebSocketServer } from 'vite'
import type { ViteHotContext } from 'vite-hot-client'
import { createRPCClient as _createRPCClient, createRPCServer as _createRPCServer } from './vite-dev-rpc'

const PLUGIN_NAME = 'vite-plugin-vue-devtools'
export function createRPCServer<T extends {}>(server: WebSocketServer, functions: Record<string, unknown>) {
  return _createRPCServer<T>(PLUGIN_NAME, server, functions)
}

export function createRPCClient<T extends {}>(ctx: ViteHotContext, functions: Partial<T>) {
  return _createRPCClient<T>(PLUGIN_NAME, ctx, functions)
}
