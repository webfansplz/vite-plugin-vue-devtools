import { createRPCClient } from '@vite-plugin-vue-devtools/core'
import { createHotContext } from 'vite-hot-client'

import { hookApi } from './hook'

const viteHotCtx = (await createHotContext('/___', `${location.pathname.split('/__devtools__')[0] || ''}/`.replace(/\/\//g, '/')))!

export const rpc
  = createRPCClient<RPCFunctions>(viteHotCtx, {
    onTerminalData({ data }: { id?: string; data: string }) {
      hookApi.hook.emit('__vue-devtools:terminal:data__', data)
    },
    onTerminalExit({ data }: { id?: string; data: string }) {
      hookApi.hook.emit('__vue-devtools:terminal:exit__', data)
    },
    onFileWatch(data: { event: string; path: string }) {
      hookApi.hook.emit('__vue-devtools:file-watch', data)
    },
  })
