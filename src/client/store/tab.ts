import type { BuiltinTab } from '../../types'
import { useDevToolsSettings } from '../composables/settings'

export const builtinTabs: BuiltinTab[] = [
  {
    path: 'overview',
    title: 'Overview',
    icon: 'i-carbon-information',
  },
  {
    path: 'pages',
    title: 'Pages',
    icon: 'i-carbon-tree-view-alt',
  },
  {
    path: 'components',
    title: 'Components',
    icon: 'i-carbon-assembly-cluster',
  },
  {
    path: 'assets',
    title: 'Assets',
    icon: 'i-carbon-image-copy',
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
  },
  // migrate to inspector button
  // {
  //   title: 'Inspector',
  //   icon: 'i-carbon-select-window',
  //   category: 'advanced',
  //   event: (client, router) => {
  //     router.replace('/__inspecting')
  //     client?.inspector?.enable()
  //   },
  // },
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

type BuiltinTabGroup = 'app' | 'modules' | 'advanced'
const DEFAULT_TAB_GROUP = 'app'

const settings = useDevToolsSettings()

function getGroupedTab(dataSource: BuiltinTab[], enabledOnly = false) {
  const groups: Record<BuiltinTabGroup, typeof builtinTabs> = {
    app: [],
    modules: [],
    advanced: [],
  }

  for (const tab of dataSource) {
    const group = tab?.group || DEFAULT_TAB_GROUP
    if (enabledOnly && settings.hiddenTabGroups.value.includes(group))
      continue
    if (!groups[group])
      console.warn(`Unknown tab group: ${group}`)
    else
      groups[group].push(tab)
  }

  return Object.entries(groups)
}

// ---- States ----
const enabledTabs = computed(() => {
  return builtinTabs.filter(tab => !settings.hiddenTabs.value.includes(tab.title ?? ''))
})
const allTabs = computed(() => builtinTabs)
const allGroupedTab = ref(getGroupedTab(builtinTabs))
const enabledGroupedTab = ref(getGroupedTab(enabledTabs.value, true))
// ---- End ----

export function useTabStore() {
  return {
    enabled: enabledTabs,
    all: allTabs,
  }
}

export function useGroupedTabStore(enabledOnly = true) {
  return enabledOnly ? enabledGroupedTab : allGroupedTab
}
