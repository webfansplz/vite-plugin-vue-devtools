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

const DEFAULT_TAB_GROUP: AllTabGroup = 'ungrouped'
const settings = useDevToolsSettings()

// ---- States ----
const allTabs = useLocalStorage<Tab[]>(TABS_STORAGE_KEY, builtinTabs.map(tab => ({
  ...tab,
  disabled: settings.hiddenTabs.value.includes(tab.title),
  group: tab.group || DEFAULT_TAB_GROUP,
  groupIndex: -1,
})))

const enabledTabs = computed(() => allTabs.value.filter(item => !item.disabled))

const groupsData = useLocalStorage(TABS_GROUP_STORAGE_KEY,
  initGroupData(allTabs.value),
)
// FIXME: should be computed
const allGroupedTabs = ref(getGroupedTab(allTabs.value))
const groupedEnabledTabs = ref(getGroupedTab(allTabs.value, true))

// ---- Watchers ----
watch(settings.hiddenTabs, (tabsNames) => {
  updateDisabledTabs(tabsNames)
})
watch(settings.hiddenTabGroups, (groupNames) => {
  updateDisabledTabs(groupNames.flatMap(name => groupsData.value[name]))
})

// ---- Composables ----
export function useTabStore() {
  return {
    enabled: enabledTabs,
    all: allTabs,
  }
}
export function useGroupedTabStore(enabledOnly: boolean) {
  return enabledOnly ? groupedEnabledTabs : allGroupedTabs
}

// ---- Utils ----
function getGroupedTab(dataSource: Tab[], enabledOnly = false) {
  const groups: Record<AllTabGroup, typeof builtinTabs> = {
    app: [],
    modules: [],
    advanced: [],
    ungrouped: [],
  }

  for (const tab of dataSource) {
    if (enabledOnly && tab.disabled)
      continue
    const group = tab.group
    if (!groups[group])
      console.warn(`Unknown tab group: ${group}`)
    else
      groups[group].push(tab)
  }

  return Object.entries(groups) as [AllTabGroup, Tab[]][]
}

function initGroupData(tabs: Tab[]) {
  return tabs.reduce((groups, tab) => {
    const group = tab.group
    if (!groups[group])
      groups[group] = []
    groups[group].push({ name: tab.title, index: tab.groupIndex })
    return groups
  }, {} as Record<AllTabGroup, { name: string; index: number }[]>)
}

function updateDisabledTabs(disabledTabNames: string[]) {
  allTabs.value.forEach((tab) => {
    tab.disabled = disabledTabNames.includes(tab.title)
  })
  groupsData.value = initGroupData(allTabs.value)
}
