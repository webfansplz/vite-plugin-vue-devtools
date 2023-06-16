import type { BuiltinTab } from '../../types'
import { useDevToolsSettings } from './settings'

export enum BuiltinTabKey {
  OVERVIEW_KEY,
  PAGES_KEY,
  COMPONENTS_KEY,
  ASSETS_KEY,
  TIMELINE_KEY,
  PINIA_KEY,
  ROUTES_KEY,
  INSPECTORE_KEY,
  EyeDropper_KEY,
  COMPONENT_DOCS_KEY,
  NPM_KEY,
  GRAPH_KEY,
  INSPECT_KEY,
  DOCUMENTATIONS_KEY,
}

const localBuiltinTabs = localStorage.getItem('vite-plugin-vue-devtools:builtinTabs')

const builtinTabs: BuiltinTab[] = ((localBuiltinTabs && JSON.parse(localBuiltinTabs)) || [
  {
    path: 'overview',
    title: 'Overview',
    icon: 'i-carbon-information',
    category: 'app',
    hidden: false,
    key: BuiltinTabKey.OVERVIEW_KEY,
  },
  {
    path: 'pages',
    title: 'Pages',
    category: 'app',
    icon: 'i-carbon-tree-view-alt',
    hidden: false,
    key: BuiltinTabKey.PAGES_KEY,
  },
  {
    path: 'components',
    title: 'Components',
    category: 'app',
    icon: 'i-carbon-assembly-cluster',
    hidden: false,
    key: BuiltinTabKey.COMPONENTS_KEY,
  },
  {
    path: 'assets',
    title: 'Assets',
    category: 'app',
    icon: 'i-carbon-image-copy',
    hidden: false,
    key: BuiltinTabKey.ASSETS_KEY,
  },

  {
    path: 'timeline',
    title: 'Timeline',
    category: 'app',
    icon: 'i-icon-park-outline:vertical-timeline',
    hidden: false,
    key: BuiltinTabKey.TIMELINE_KEY,
  },
  {
    path: 'pinia',
    title: 'Pinia',
    icon: 'icon-park-outline:pineapple',
    category: 'modules',
    hidden: false,
    key: BuiltinTabKey.PINIA_KEY,
  },
  {
    path: 'routes',
    title: 'Routes',
    icon: 'gis:map-route',
    category: 'modules',
    hidden: false,
    key: BuiltinTabKey.ROUTES_KEY,
  },
  {
    title: 'Inspector',
    icon: 'i-carbon-select-window',
    category: 'advanced',
    event: (client, router) => {
      router.replace('/__inspecting')
      client?.inspector?.enable()
    },
    hidden: false,
    key: BuiltinTabKey.INSPECTORE_KEY,
  },
  {
    title: 'EyeDropper',
    icon: 'i-mdi:eyedropper',
    category: 'advanced',
    event: (client, router) => {
      router.replace('/__eyedropper')
      client.panel?.toggleViewMode('xs')
    },
    hidden: false,
    key: BuiltinTabKey.EyeDropper_KEY,
  },
  {
    title: 'Component docs',
    path: 'component-docs',
    icon: 'i-carbon-document-preliminary',
    category: 'advanced',
    key: BuiltinTabKey.COMPONENT_DOCS_KEY,
  },
  {
    path: 'npm',
    title: 'Search packages',
    icon: 'i-teenyicons:npm-outline',
    category: 'advanced',
    hidden: false,
    key: BuiltinTabKey.NPM_KEY,
  },
  {
    title: 'Graph',
    path: 'graph',
    icon: 'i-carbon-network-4',
    category: 'advanced',
    hidden: false,
    key: BuiltinTabKey.GRAPH_KEY,
  },
  {
    path: 'inspect',
    title: 'Inspect',
    icon: 'i-carbon-ibm-watson-discovery',
    category: 'advanced',
    hidden: false,
    key: BuiltinTabKey.INSPECT_KEY,
  },
  {
    path: 'documentations',
    title: 'Documentations',
    icon: 'i-carbon-document',
    category: 'advanced',
    hidden: false,
    key: BuiltinTabKey.DOCUMENTATIONS_KEY,
  },
])
const builtinTabsSettings: BuiltinTab[] = reactive([...builtinTabs])

export function useTabs() {
  const settings = useDevToolsSettings()
  return {
    enabled: computed(() => {
      return builtinTabs.map((tab) => {
        if (settings.hiddenTabs.value.includes(tab.title))
          tab.hidden = true
        else
          tab.hidden = false

        return tab
      })
    }),
    all: computed(() => builtinTabsSettings),
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

export function useSortCategories(
  innerMoveOptions: {
    categories: any[]
  }) {
  const temp = innerMoveOptions.categories.reduce((pre, cur) => {
    pre.push(...cur[1])
    return pre
  }, [])
  builtinTabsSettings.length = 0
  builtinTabsSettings.splice(0, 0, ...temp)
  localStorage.setItem('vite-plugin-vue-devtools:builtinTabs', JSON.stringify(temp))
}
