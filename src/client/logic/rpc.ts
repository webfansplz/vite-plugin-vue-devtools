import '../../types'
import { addClientFunction, clientRPC } from 'vite-plugin-devtools/client'
import { hookApi } from './hook'

addClientFunction('onTerminalData', ({ data }) => {
  hookApi.hook.emit('__vue-devtools:terminal:data__', data)
})

addClientFunction('onTerminalExit', ({ data }) => {
  hookApi.hook.emit('__vue-devtools:terminal:exit__', data)
})

export const rpc = clientRPC

export const inspectClientUrl = await rpc.inspectClientUrl()
