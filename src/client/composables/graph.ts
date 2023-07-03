const showGraphSetting = ref(false)

export interface GraphSettings {
  hoverPathLevel: 'custom' | 'absolute' | 'root'
  hoverPathLevelCustom: number
  clickOpenInEditor: boolean
  highlightSelection: boolean
  enableUserDefinedGlob: boolean
}

const graphSettings = useLocalStorage<GraphSettings>('__vue-devtools-graph-settings__', {
  hoverPathLevel: 'root',
  hoverPathLevelCustom: 4,
  clickOpenInEditor: true,
  highlightSelection: true,
  enableUserDefinedGlob: false,
}, { mergeDefaults: true })

export function useGraphSettings() {
  onDeactivated(() => showGraphSetting.value = false)
  onBeforeUnmount(() => showGraphSetting.value = false)

  return {
    showGraphSetting,
    graphSettings,
  }
}
