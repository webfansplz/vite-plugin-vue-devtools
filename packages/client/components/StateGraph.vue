<script setup lang="ts">
import type { ScanVariableDeclarationResult } from 'esm-analyzer'
import { Network } from 'vis-network'
import type { Node, Options } from 'vis-network'
import { currentSelectedFile } from '../logic/state-graph'
import { useDevToolsClient } from '~/logic/client'
import { stateGraphRawData } from '~/logic/state-graph'

const isHoveringNode = ref(false)
const container = ref<HTMLDivElement>()

const map = ref<Map</* variable name */string, ScanVariableDeclarationResult>>(new Map())
const nodes = ref<Node[]>([])

const { meta: metaKeyPressed } = useMagicKeys({
  passive: true,
})

watchEffect(() => {
  nodes.value = []
  if (!stateGraphRawData.value) {
    nodes.value = []
    return map.value.clear()
  }
  nodes.value = []
  map.value.clear()
  for (const [variable] of stateGraphRawData.value) {
    map.value.set(variable.name, variable)
    nodes.value.push({
      id: variable.name,
      title: variable.name,
      label: variable.name,
      size: 15,
    })
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

  const network = new Network(container.value!, {
    nodes: nodes.value,
  }, options)

  const client = useDevToolsClient()

  network.on('click', (params) => {
    const nodeId = params.nodes?.[0]
    if (metaKeyPressed.value) {
      const { loc: { start: { line, column } } } = map.value.get(nodeId!)!
      return client.value.openInEditor(currentSelectedFile.value!, line, column)
    }
  })
  watch(nodes, (nodes) => {
    network.setData({ nodes })
  })
})
</script>

<template>
  <div ref="container" flex="1" :class="[isHoveringNode ? 'cursor-pointer' : '']" />
</template>
