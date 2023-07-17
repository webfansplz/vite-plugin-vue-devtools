const showGraphSetting = ref(false)

export interface GraphSettingsType {
  hoverPathLevel: 'custom' | 'absolute' | 'root'
  hoverPathLevelCustom: number
  clickOpenInEditor: boolean
  highlightSelection: boolean
  enableUserDefinedGlob: boolean
}

const graphSettingsInStorage = useLocalStorage<GraphSettingsType>('__vue-devtools-graph-settings__', {
  hoverPathLevel: 'root',
  hoverPathLevelCustom: 4,
  clickOpenInEditor: true,
  highlightSelection: true,
  enableUserDefinedGlob: false,
}, { mergeDefaults: true })

// Avoid TS known issue: https://github.com/microsoft/TypeScript/issues/47663 when running build command
const graphSettings = computed(() => graphSettingsInStorage.value)

export function useGraphSettings() {
  onDeactivated(() => showGraphSetting.value = false)
  onBeforeUnmount(() => showGraphSetting.value = false)

  return {
    showGraphSetting,
    graphSettings,
  }
}
