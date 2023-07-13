<script setup lang="ts">
import type { Data, Options } from 'vis-network'
import { Network } from 'vis-network'
import { searchResults as modules } from '../logic/graph'
import { useDevToolsClient } from '../logic/client'
import { rootPath } from '../logic/global'
import { useGraphSettings } from '../composables/graph'
import type { GraphSettingsType } from '../composables/graph'

const isDark = useDark()
const container = ref<HTMLDivElement | null>()
const modulesMap = shallowRef<Map<string, { filePath: string }>>(new Map())
const settings = useGraphSettings()
const { meta: metaKeyPressed } = useMagicKeys({
  passive: true,
})
const isHoveringNode = ref(false)
const lastSelectedNode = ref<string>()
const client = useDevToolsClient()

function getHoverPath(level: GraphSettingsType['hoverPathLevel'], fullPath: string, rootPath: string) {
  switch (level) {
    case 'absolute':
      return fullPath
    case 'custom':
      return fullPath.split('/').slice(-settings.graphSettings.value.hoverPathLevelCustom).join('/')
    case 'root':
    default:
      return fullPath.replace(rootPath, '')
  }
}

const data = computed<Data>(() => {
  const { data, main } = modules.value
  if (!data)
    return { node: [], edges: [] }
  const nodes: Data['nodes'] = data.map((mod) => {
    const path = mod.id.replace(/\?.*$/, '').replace(/\#.*$/, '')
    const pathSegments = path.split('/')
    const id = mod.id

    if (!modulesMap.value.has(id))
      modulesMap.value.set(id, { filePath: path })
    else
      modulesMap.value.get(id)!.filePath = path
    const isInMain = !!main.find(i => i.id === id)

    return {
      id,
      label: isInMain ? `<b>${pathSegments.at(-1)}</b>` : pathSegments.at(-1),
      title: getHoverPath(settings.graphSettings.value.hoverPathLevel, path, rootPath),
      group: path.match(/\.(\w+)$/)?.[1] || 'unknown',
      size: 15 + Math.min(mod.deps.length / 2, 8),
      font: {
        color: isInMain
          ? '#F19B4A'
          : isDark.value ? 'white' : 'black',
        multi: 'html',
      },
      shape: mod.id.includes('/node_modules/')
        ? 'hexagon'
        : mod.virtual
          ? 'diamond'
          : 'dot',
    }
  })
  const edges: Data['edges'] = data.flatMap(mod => mod.deps.map(dep => ({
    from: mod.id,
    to: dep,
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 0.8,
      },
    },
  })))

  return {
    nodes,
    edges,
  }
})

onMounted(() => {
  const options: Options = {
    nodes: {
      shape: 'dot',
      size: 16,
    },
    interaction: {
      hover: true,
    },
    physics: {
      maxVelocity: 146,
      solver: 'forceAtlas2Based',
      timestep: 0.35,
      stabilization: {
        enabled: true,
        iterations: 200,
      },
    },
    groups: {
      vue: {
        color: '#42b883',
      },
      ts: {
        color: '#41b1e0',
      },
      js: {
        color: '#d6cb2d',
      },
      json: {
        color: '#cf8f30',
      },
      css: {
        color: '#e6659a',
      },
      html: {
        color: '#e34c26',
      },
      svelte: {
        color: '#ff3e00',
      },
      jsx: {
        color: '#7d6fe8',
      },
      tsx: {
        color: '#7d6fe8',
      },
    },
  }

  const network = new Network(container.value!, data.value, options)

  const resetNodeStyle = () => {
    if (!settings.graphSettings.value.highlightSelection)
      return
    // @ts-expect-error network body typing error
    network.body.data.nodes.update(network.body.data.nodes.getIds().map(id => ({ id, size: 16 })))
    // @ts-expect-error network body typing error
    network.body.data.edges.update(network.body.data.edges.getIds().map((id) => {
      // @ts-expect-error network body typing error
      const group = network.body.data.nodes.get(network.body.data.edges.get(id)!.from).group
      return {
        id,
        // default unknown group color
        color: options.groups[group]?.color ?? '#97C2FC',
      }
    }))
  }

  network.on('click', (params) => {
    const nodeId = params.nodes?.[0]
    if (!nodeId)
      return resetNodeStyle()
    if (settings.graphSettings.value.clickOpenInEditor && metaKeyPressed.value)
      return client.value.openInEditor(modulesMap.value.get(nodeId)!.filePath)
    if (lastSelectedNode.value && lastSelectedNode.value !== nodeId)
      resetNodeStyle()
    if (!settings.graphSettings.value.highlightSelection)
      return
    // @ts-expect-error network body typing error
    const nonConnectedNodes = network.body.data.nodes.getIds().filter(id => !network.getConnectedNodes(nodeId).includes(id) && nodeId !== id)
    // @ts-expect-error network body typing error
    const nonConnectedEdges = network.body.data.edges.getIds().filter(id => !network.getConnectedEdges(nodeId).includes(id))
    // @ts-expect-error network body typing error
    network.body.data.nodes.update(nonConnectedNodes.map(id => ({ id, color: 'rgb(69,69,69,.3)' })))
    // @ts-expect-error network body typing error
    network.body.data.edges.update(nonConnectedEdges.map(id => ({ id, color: 'rgb(69,69,69,.3)' })))
    // @ts-expect-error network body typing error
    network.body.data.nodes.update([{ id: nodeId, color: options.groups[network.body.data.nodes.get(nodeId).group]?.color, size: 26 }])
    lastSelectedNode.value = nodeId
  })

  network.on('hoverNode', () => {
    isHoveringNode.value = true
  })
  network.on('blurNode', () => {
    isHoveringNode.value = false
  })

  watch(data, () => {
    network.setData(data.value)
  })
})
const { showGraphSetting } = useGraphSettings()
</script>

<template>
  <div relative h-screen w-full flex flex-col n-panel-grids>
    <SearchBox>
      <template #right>
        <button aria-label="Open graph settings" @click="showGraphSetting = true">
          <div i-carbon-settings />
        </button>
      </template>
    </SearchBox>
    <div ref="container" flex="1" :class="[isHoveringNode && metaKeyPressed ? 'cursor-pointer' : '']" />
    <GraphSettings />
  </div>
</template>
