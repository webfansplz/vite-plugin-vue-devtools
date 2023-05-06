import type { BuiltinTab } from '../../types'
import { useDevToolsSettings } from './settings'

const builtinTabs: BuiltinTab[] = [
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
    icon: 'gis:map-route',
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
    title: 'Inspector',
    icon: 'i-carbon-select-window',
    category: 'advanced',
    event: (client, router) => {
      router.push('/__inspecting')
      client?.inspector?.enable()
    },
  },
]

export function useTabs() {
  const settings = useDevToolsSettings()
  return {
    enabled: computed(() => {
      return builtinTabs.filter(tab => !settings.hiddenTabs.value.includes(tab.title ?? ''))
    }),
    all: computed(() => builtinTabs),
  }
}

export function useCategorizedTabs(enabledOnly = true) {
  const _tabs = useTabs()
  const tabs = enabledOnly
    ? _tabs.enabled
    : _tabs.all

  const settings = useDevToolsSettings()

  return computed(() => {
    const categories: Record<'app' | 'modules' | 'advanced', typeof builtinTabs> = {
      app: [],
      modules: [],
      advanced: [],
    }

    for (const tab of tabs.value) {
      const category = tab?.category || 'app'
      if (enabledOnly && settings.hiddenTabCategories.value.includes(category))
        continue
      if (!categories[category])
        console.warn(`Unknown tab category: ${category}`)
      else
        categories[category].push(tab)
    }

    return Object.entries(categories)
  })
}
