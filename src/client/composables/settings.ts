import { toRefs } from '@vueuse/core'

export interface GraphSettings {
  hoverPathLevel: 'custom' | 'absolute' | 'root'
  hoverPathLevelCustom: number
  clickOpenInEditor: boolean
  highlightSelection: boolean
}

export interface DevToolsUISettings {
  scale: number
  hiddenTabs: string[]
  hiddenTabGroups: string[]
  graph: GraphSettings
}

const devToolsSettings = useLocalStorage<DevToolsUISettings>('__vue-devtools-settings__', {
  scale: 1,
  hiddenTabs: [],
  hiddenTabGroups: [],
  graph: {
    hoverPathLevel: 'root',
    hoverPathLevelCustom: 4,
    clickOpenInEditor: true,
    highlightSelection: true,
  },
}, { mergeDefaults: true })

const devToolsSettingsRefs = toRefs(devToolsSettings)

export function useDevToolsSettings() {
  return devToolsSettingsRefs
}
