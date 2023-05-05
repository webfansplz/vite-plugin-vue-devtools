import { toRefs } from '@vueuse/core'

export interface DevToolsUISettings {
  scale: number
  hiddenTabs: string[]
  hiddenTabCategories: string[]
}

const devToolsSettings = useLocalStorage<DevToolsUISettings>('__vue-devtools-settings__', {
  scale: 1,
  hiddenTabs: [],
  hiddenTabCategories: [],
}, { mergeDefaults: true })

const devToolsSettingsRefs = toRefs(devToolsSettings)

export function useDevToolsSettings() {
  return devToolsSettingsRefs
}
