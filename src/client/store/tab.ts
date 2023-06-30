import type { ComputedRef, Ref } from 'vue'
import type { AllTabGroup, BuiltinTab, Tab } from '../../types'
import { useDevToolsSettings } from '../composables/settings'
import { TABS_GROUP_STORAGE_KEY, TABS_STORAGE_KEY } from '../constants'

export const builtinTabs: BuiltinTab[] = [
  {
    path: 'overview',
    title: 'Overview',
    icon: 'i-carbon-information',
    group: 'app',
  },
  {
    path: 'pages',
    title: 'Pages',
    icon: 'i-carbon-tree-view-alt',
    group: 'app',
  },
  {
    path: 'components',
    title: 'Components',
    icon: 'i-carbon-assembly-cluster',
    group: 'app',
  },
  {
    path: 'assets',
    title: 'Assets',
    icon: 'i-carbon-image-copy',
    group: 'app',
  },
  {
    path: 'routes',
    title: 'Routes',
    icon: 'mdi:location-path',
    group: 'modules',
  },
  {
    path: 'pinia',
    title: 'Pinia',
    icon: 'icon-park-outline:pineapple',
    group: 'modules',
  },
  {
    path: 'timeline',
    title: 'Timeline',
    icon: 'i-icon-park-outline:vertical-timeline',
    group: 'app',
  },
  {
    title: 'EyeDropper',
    icon: 'i-mdi:eyedropper',
    group: 'advanced',
    event: (client, router) => {
      router.replace('/__eyedropper')
      client.panel?.toggleViewMode('xs')
    },
  },
  {
    path: 'component-docs',
    title: 'Component docs',
    icon: 'i-carbon-document-preliminary',
    group: 'advanced',
  },
  {
    path: 'npm',
    title: 'Search packages',
    icon: 'i-teenyicons:npm-outline',
    group: 'advanced',
  },
  {
    path: 'graph',
    title: 'Graph',
    icon: 'i-carbon-network-4',
    group: 'advanced',
  },
  {
    path: 'inspect',
    title: 'Inspect',
    icon: 'i-carbon-ibm-watson-discovery',
    group: 'advanced',
  },
  {
    path: 'documentations',
    title: 'Documentations',
    icon: 'i-carbon-document',
    group: 'advanced',
  },
]

export const DEFAULT_TAB_GROUP: AllTabGroup = 'ungrouped'
const settings = useDevToolsSettings()

function getInitialTabs() {
  return builtinTabs.map(tab => ({
    ...tab,
    disabled: settings.hiddenTabs.value.includes(tab.title),
    group: tab.group ?? DEFAULT_TAB_GROUP,
    groupIndex: -1,
  }))
}

// ---- States ----
const allTabs = useLocalStorage<Tab[]>(TABS_STORAGE_KEY, getInitialTabs(), {
  shallow: true,
})

const enabledTabs = computed(() => allTabs.value.filter(item => !item.disabled))

const groupsData = useLocalStorage(TABS_GROUP_STORAGE_KEY, initGroupData(allTabs.value))
const allGroupedTabs = computed(() => getGroupedTab(allTabs.value))
const enabledGroupedTabs = computed(() => getGroupedTab(allTabs.value, true))

// ---- Watchers ----
watch([settings.hiddenTabs, settings.hiddenTabGroups], ([tabsNames, groupNames]) => {
  const allTabsNames = [...tabsNames, ...groupNames.flatMap(name => groupsData.value[name].data.map((item: { name: string }) => item.name))]
  updateDisabledTabs(allTabsNames, groupNames)
})
// ---- Composables ----
export function useTabStore(): ({ enabled: ComputedRef<Tab[]>; all: Ref<Tab[]> }) {
  return {
    enabled: enabledTabs,
    all: allTabs,
  }
}
export function useGroupedTabStore(enabledOnly: boolean) {
  return enabledOnly ? enabledGroupedTabs : allGroupedTabs
}

// ---- Utils ----
function getGroupedTab(dataSource: Tab[], enabledOnly = false) {
  const groupsKeys = Object.keys(groupsData.value)
  if (groupsKeys.includes(DEFAULT_TAB_GROUP)) {
    // DEFAULT_TAB_GROUP should always be the last one
    groupsKeys.splice(groupsKeys.indexOf(DEFAULT_TAB_GROUP), 1)
    groupsKeys.push(DEFAULT_TAB_GROUP)
  }
  const groups: Record<string, { show: boolean; tabs: typeof builtinTabs }> = groupsKeys.reduce((groups, key) => {
    groups[key] = {
      show: groupsData.value[key].show,
      tabs: [],
    }
    return groups
  }, {})

  if (!groupsKeys.includes(DEFAULT_TAB_GROUP)) {
    groups[DEFAULT_TAB_GROUP] = {
      show: true,
      tabs: [],
    }
  }

  for (const tab of dataSource) {
    if (enabledOnly && tab.disabled)
      continue
    const group = tab.group
    if (!groups[group])
      console.warn(`Unknown tab group: ${group}`)
    else
      groups[group].tabs.push(tab)
  }

  return Object.entries(groups) as [AllTabGroup, { show: boolean; tabs: Tab[] } ][]
}

interface GroupData { name: string; index: number }

function initGroupData(tabs: Tab[]) {
  return tabs.reduce((groups, tab) => {
    const group = tab.group
    if (!groups[group]) {
      groups[group] = {
        show: true,
        data: [],
      }
    }
    groups[group].data.push({
      name: tab.title, index: tab.groupIndex,
    })
    return groups
  }, {} as Record<AllTabGroup, { data: GroupData[]; show: boolean }>)
}

function updateDisabledTabs(disabledTabNames: string[], disabledGroups: string[] = []) {
  const currentTabs = allTabs.value.slice()
  currentTabs.forEach((tab) => {
    tab.disabled = disabledTabNames.includes(tab.title)
  })
  allTabs.value = currentTabs
  // reset all groups to show: true
  for (const group of Object.values(groupsData.value))
    group.show = true
  if (disabledGroups.length) {
    for (const group of disabledGroups)
      groupsData.value[group].show = false
  }
}

export function updateTabsPosition(groupName: AllTabGroup, newTabs: Tab[]) {
  const currentTabs = allTabs.value.slice()
  currentTabs.forEach((tab) => {
    const newTab = newTabs.find(item => item.title === tab.title)
    if (newTab) {
      // Use index as groupIndex
      const index = newTabs.indexOf(newTab)
      tab.groupIndex = index
      if (tab.group !== groupName)
        tab.group = groupName
    }
  })
  allTabs.value = currentTabs

  groupsData.value[groupName].data = newTabs.map(item => ({
    name: item.title, index: item.groupIndex,
  }))
}

export function getSortedTabs(sourceTabs: Tab[]) {
  const tabs = sourceTabs.slice()
  tabs.sort((a, b) => a.groupIndex - b.groupIndex)
  return tabs
}

function updateUngroupedData(data: GroupData[]) {
  if (!groupsData.value[DEFAULT_TAB_GROUP])
    createGroup(DEFAULT_TAB_GROUP)
  groupsData.value[DEFAULT_TAB_GROUP].data = data
}

export function ungroupAllTabs() {
  const tabs = allTabs.value.slice()
  const names: string[] = []
  tabs.forEach((tab) => {
    tab.group = DEFAULT_TAB_GROUP
    tab.groupIndex = -1
    names.push(tab.title)
  })
  allTabs.value = tabs
  updateUngroupedData(names.map(name => ({ name, index: -1 })))
}

export function resetAllTabs() {
  allTabs.value = getInitialTabs()
  groupsData.value = initGroupData(allTabs.value)
}

export function shouldHideTabGroup(groupName: string, tabLength: number) {
  return groupName === DEFAULT_TAB_GROUP && tabLength === 0
}

export function removeTabGroup(group: AllTabGroup) {
  const tabs = allTabs.value.slice()
  const tabNames: string[] = []
  tabs.forEach((item) => {
    if (item.group === group) {
      item.group = DEFAULT_TAB_GROUP
      item.groupIndex = -1
      tabNames.push(item.title)
    }
  })
  allTabs.value = tabs
  Reflect.deleteProperty(groupsData.value, group)

  updateUngroupedData(tabNames.map(name => ({ name, index: -1 })))
}

export function checkGroupExist(groupName: string) {
  return groupsData.value[groupName]
}

export function createGroup(groupName: string) {
  groupsData.value[groupName] = {
    show: true,
    data: [],
  }
}

export function getMappedBuiltinTabs(tab: Tab) {
  return builtinTabs.find(item => item.title === tab.title)
}
