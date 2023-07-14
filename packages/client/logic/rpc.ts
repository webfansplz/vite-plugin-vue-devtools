import { createHotContext } from 'vite-hot-client'
import { createRPCClient } from '../../vite-dev-rpc'
import type { RPCFunctions } from '../../types'
import { hookApi } from './hook'

export const rpc
  = createRPCClient<RPCFunctions>('vite-plugin-vue-devtools', (await createHotContext('/___', `${location.pathname.split('/__devtools__')[0] || ''}/`.replace(/\/\//g, '/')))!, {
    onTerminalData({ data }: { id?: string; data: string }) {
      hookApi.hook.emit('__vue-devtools:terminal:data__', data)
    },
    onTerminalExit({ data }: { id?: string; data: string }) {
      hookApi.hook.emit('__vue-devtools:terminal:exit__', data)
    },
  })
