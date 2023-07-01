<script setup lang="ts">
import type { Data, Options } from 'vis-network'
import { Network } from 'vis-network'
import { searchResults as modules } from '../logic/graph'

const isDark = useDark()
// const modules = ref<ModuleInfo[]>()
const container = ref<HTMLDivElement | null>()

const nodeInfo = computed(() => {
  const pathMap: Record<string, string> = {}
  const nodes: Data['nodes'] = modules.value?.map((mod) => {
    const path = mod.id.replace(/\?.*$/, '').replace(/\#.*$/, '')
    pathMap[mod.id] = path

    return {
      id: mod.id,
      label: path.split('/').splice(-1)[0],
      title: path.split('/').splice(-4).join('/'),
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

  return {
    nodes,
    pathMap,
  }
})

const data = computed<Data>(() => {
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
    nodes: nodeInfo.value.nodes,
    edges,
  }
})

onMounted(() => {
  const options: Options = {
    nodes: {
      shape: 'dot',
      size: 16,
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

  // network.on('click', (data) => {
  //   const node = data.nodes?.[0]
  //   // if (node)
  //   //   router.push(`/module?id=${encodeURIComponent(node)}`)
  // })

  network.on('selectNode', (data) => {
    const file = nodeInfo.value.pathMap[data.nodes?.[0]]
    fetch(`${location.origin}/__open-in-editor?file=${file}`, { mode: 'no-cors' })
  })

  watch(data, () => {
    network.setData(data.value)
  })
})
</script>

<template>
  <div h-screen w-full flex flex-col n-panel-grids>
    <SearchBox />
    <div ref="container" flex="1" />
  </div>
</template>
