<script setup lang="tsx">
// @ts-expect-error missing type
import VDSelect from '@vite-plugin-vue-devtools/ui-kit/components/Select.vue'

// @ts-expect-error missing type
import VDSwitch from '@vite-plugin-vue-devtools/ui-kit/components/Switch.vue'

const { showGraphSetting, graphSettings } = useGraphSettings()

const graphHoverPathLevel = [
  ['Root in vite config', 'root'],
  ['Custom level', 'custom'],
  ['Absolute', 'absolute'],
]
const graphHoverPathLevelCustom = [
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
]

interface Settings {
  name: string
  description?: string
  comp: () => JSX.Element
}

const settings = [
  {
    name: 'Path level',
    description: 'Display the path level of the hovered node',
    comp: () => <>
      <VDSelect v-model={graphSettings.value.hoverPathLevel} class="n-primary">
        {graphHoverPathLevel.map(([key, value]) => <option key={key}>{ value }</option>) }
      </VDSelect>
      {
        graphSettings.value.hoverPathLevel === 'custom'
          && <VDSelect v-model={graphSettings.value.hoverPathLevelCustom} class="n-primary">
            { graphHoverPathLevelCustom.map(([key, value]) => <option key={key}>{ value }</option>) }
            </VDSelect>
      }
    </>,
  },
  {
    name: 'Open in editor',
    description: 'Press Alt/Cmd + click on a node to open the file in editor',
    comp: () => <VDSwitch v-model={graphSettings.value.clickOpenInEditor} class="n-primary" />,
  },
  {
    name: 'Highlight related node',
    description: 'Highlight the directly related node when clicking on a node',
    comp: () => <VDSwitch v-model={graphSettings.value.highlightSelection} class="n-primary" />,
  },
  {
    name: 'Glob pattern',
    description: 'Enable glob pattern to pre-filter modules. Use dot + space(", ") to separate multiple patterns.',
    comp: () => <VDSwitch v-model={graphSettings.value.enableUserDefinedGlob} class="n-primary" />,
  },
] satisfies Settings[]
</script>

<template>
  <VDDialog
    v-model="showGraphSetting" class="z-2000 min-w-500px w-50vw flex flex-col gap6 p6"
    @close="showGraphSetting = false"
  >
    <div flex="~" items-center justify-between>
      <h1 m="!0" text-2xl>
        Graph Settings
      </h1>
      <button aria-label="Close graph settings">
        <div i-carbon-close text-2xl hover="color-primary" transition-colors @click="showGraphSetting = false" />
      </button>
    </div>
    <div flex="~ col" gap4>
      <div v-for="setting in settings" :key="setting.name" flex="~" items-center justify-between>
        <div flex="~ col" gap-5px>
          <p text-4>
            {{ setting.name }}
          </p>
          <p v-if="setting.description" text-sm text-secondary>
            {{ setting.description }}
          </p>
        </div>
        <div flex gap-1>
          <component :is="setting.comp" />
        </div>
      </div>
    </div>
  </VDDialog>
</template>

<style scoped></style>
