import { useGroupedTabStore, useTabStore } from '../store'

export function useTabs() {
  return useTabStore()
}

export function useGroupedTabs(enabledOnly = true) {
  return useGroupedTabStore(enabledOnly)
}
