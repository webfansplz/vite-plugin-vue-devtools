import { useCategorizedTabsStore, useTabStore } from '../store'

export function useTabs() {
  return useTabStore()
}

export function useCategorizedTabs(enabledOnly = true) {
  return useCategorizedTabsStore(enabledOnly)
}
