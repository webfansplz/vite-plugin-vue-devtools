import type { WebSocketServer } from 'vite'
import { createHotContext } from 'vite-hot-client'
import { createRPCClient as _createRPCClient, createRPCServer as _createRPCServer } from './vite-dev-rpc'

const PLUGIN_NAME = 'vite-plugin-vue-devtools'

export function createRPCServer<T extends {}>(server: WebSocketServer, functions: T) {
  return _createRPCServer<T>(PLUGIN_NAME, server, functions)
}

export async function createRPCClient<T extends {}>(functions: T) {
  return _createRPCClient<T>(PLUGIN_NAME, (await createHotContext('/___', `${location.pathname.split('/__devtools__')[0] || ''}/`.replace(/\/\//g, '/')))!, functions)
}
