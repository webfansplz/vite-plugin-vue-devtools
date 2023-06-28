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
    category: 'modules',
  },
  {
    path: 'pinia',
    title: 'Pinia',
    icon: 'icon-park-outline:pineapple',
    category: 'modules',
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
    category: 'advanced',
    event: (client, router) => {
      router.replace('/__eyedropper')
      client.panel?.toggleViewMode('xs')
    },
  },
  {
    path: 'component-docs',
    title: 'Component docs',
    icon: 'i-carbon-document-preliminary',
    category: 'advanced',
  },
  {
    path: 'npm',
    title: 'Search packages',
    icon: 'i-teenyicons:npm-outline',
    category: 'advanced',
  },
  {
    path: 'graph',
    title: 'Graph',
    icon: 'i-carbon-network-4',
    category: 'advanced',
  },
  {
    path: 'inspect',
    title: 'Inspect',
    icon: 'i-carbon-ibm-watson-discovery',
    category: 'advanced',
  },
  {
    path: 'documentations',
    title: 'Documentations',
    icon: 'i-carbon-document',
    category: 'advanced',
  },
]

type BuiltinTabCategory = 'app' | 'modules' | 'advanced'
const DEFAULT_TAB_CATEGORY = 'app'

const settings = useDevToolsSettings()

function getCategorizedTabs(dataSource: BuiltinTab[], enabledOnly = false) {
  const categories: Record<BuiltinTabCategory, typeof builtinTabs> = {
    app: [],
    modules: [],
    advanced: [],
  }

  for (const tab of dataSource) {
    const category = tab?.category || DEFAULT_TAB_CATEGORY
    if (enabledOnly && settings.hiddenTabCategories.value.includes(category))
      continue
    if (!categories[category])
      console.warn(`Unknown tab category: ${category}`)
    else
      categories[category].push(tab)
  }

  return Object.entries(categories)
}

// ---- States ----
const enabledTabs = computed(() => {
  return builtinTabs.filter(tab => !settings.hiddenTabs.value.includes(tab.title ?? ''))
})
const allTabs = computed(() => builtinTabs)
const allCategorizedTabs = computed(() => getCategorizedTabs(builtinTabs))
const enabledCategorizedTabs = computed(() => getCategorizedTabs(enabledTabs.value, true))
// ---- End ----

export function useTabStore() {
  return {
    enabled: enabledTabs,
    all: allTabs,
  }
}

export function useCategorizedTabsStore(enabledOnly = true) {
  return enabledOnly ? enabledCategorizedTabs : allCategorizedTabs
}
