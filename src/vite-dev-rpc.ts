import type { ChannelOptions } from 'birpc'
import { cachedMap, createBirpc, createBirpcGroup } from 'birpc'
import type { WebSocketClient, WebSocketServer } from 'vite'
import type { ViteHotContext } from 'vite-hot-client'

export function createRPCServer<ClientFunction = {}, ServerFunctions = {}>(
  name: string,
  ws: WebSocketServer,
  functions: ServerFunctions,
) {
  const event = `${name}:rpc`

  const group = createBirpcGroup<ClientFunction, ServerFunctions>(
    functions,
    () => cachedMap(
      Array.from(ws?.clients || []),
      (socket): ChannelOptions => {
        return {
          on: (fn) => {
            ws.on(event, (data: any, source: WebSocketClient) => {
              if (socket === source)
                fn(data)
            })
          },
          post: (data) => {
            socket.send(event, data)
          },
        }
      },
    ),
    {
      timeout: -1,
    },
  )

  ws.on('connection', () => {
    group.updateChannels()
  })

  return group.broadcast
}

export function createRPCClient<ServerFunctions = {}, ClientFunctions = {}>(
  name: string,
  hot: ViteHotContext | Promise<ViteHotContext>,
  functions: ClientFunctions = {} as ClientFunctions,
) {
  const event = `${name}:rpc`
  return createBirpc<ServerFunctions, ClientFunctions>(
    functions,
    {
      on: async (fn) => {
        (await hot).on(event, fn)
      },
      post: async (data) => {
        (await hot).send(event, data)
      },
      timeout: -1,
    },
  )
}
