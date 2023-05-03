import { createRPCClient } from 'vite-dev-rpc'
import { createHotContext } from 'vite-hot-client'
import type { RPCFunctions } from '../../types'

export const rpc
  = createRPCClient<RPCFunctions>('vite-plugin-vue-devtools', (await createHotContext('/___', `${location.pathname.split('/__devtools')[0] || ''}/`.replace(/\/\//g, '/')))!)

export const inspectClientUrl = await rpc.inspectClientUrl()
