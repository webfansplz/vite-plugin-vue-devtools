<script setup lang="ts">
import type { Data, Options } from 'vis-network'
import { Network } from 'vis-network'
import { searchResults as modules, rootPath } from '../logic/graph'
import type { GraphSettings } from '../composables/settings'
import { useDevToolsSettings } from '../composables/settings'

const isDark = useDark()
const container = ref<HTMLDivElement | null>()
const modulesMap = shallowRef<Map<string, { filePath: string }>>(new Map())
const settings = useDevToolsSettings()
const { meta: metaKeyPressed } = useMagicKeys({
  passive: true,
})
const isHoveringNode = ref(false)

function getHoverPath(level: GraphSettings['hoverPathLevel'], fullPath: string, rootPath: string) {
  switch (level) {
    case 'absolute':
      return fullPath
    case 'custom':
      return fullPath.split('/').slice(-settings.graph.value.hoverPathLevelCustom).join('/')
    case 'root':
    default:
      return fullPath.replace(rootPath, '')
  }
}

const data = computed<Data>(() => {
  const nodes: Data['nodes'] = modules.value?.map((mod) => {
    const path = mod.id.replace(/\?.*$/, '').replace(/\#.*$/, '')
    const pathSegments = path.split('/')
    const id = mod.id

    if (!modulesMap.value.has(id))
      modulesMap.value.set(id, { filePath: path })
    else
      modulesMap.value.get(id)!.filePath = path

    return {
      id,
      label: pathSegments.at(-1),
      title: getHoverPath(settings.graph.value.hoverPathLevel, path, rootPath.value),
      group: path.match(/\.(\w+)$/)?.[1] || 'unknown',
      size: 15 + Math.min(mod.deps.length / 2, 8),
      font: { color: isDark.value ? 'white' : 'black' },
      shape: mod.id.includes('/node_modules/')
        ? 'hexagon'
        : mod.virtual
          ? 'diamond'
          : 'dot',
    }
  })
  const edges: Data['edges'] = modules.value?.flatMap(mod => mod.deps.map(dep => ({
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

  network.on('click', (data) => {
    const nodeId = data.nodes?.[0]
    if (nodeId && settings.graph.value.clickOpenInEditor && metaKeyPressed.value)
      openInEditor(modulesMap.value.get(nodeId)!.filePath)
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
</script>

<template>
  <div h-screen w-full flex flex-col n-panel-grids>
    <SearchBox />
    <div ref="container" flex="1" :class="[isHoveringNode && metaKeyPressed ? 'cursor-pointer' : '']" />
  </div>
</template>
