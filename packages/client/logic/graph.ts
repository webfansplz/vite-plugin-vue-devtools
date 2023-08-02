import { useStorage } from '@vueuse/core'
import Fuse from 'fuse.js'
import { Minimatch } from 'minimatch'
import type { ModuleInfo } from 'vite-plugin-vue-devtools/client'
import { rpc } from './rpc'

const list = ref<ModuleInfo[]>(await rpc.componentGraph())
export const searchText = useStorage('vite-inspect-search-text', '')
export const includeNodeModules = useStorage('vite-inspect-include-node-modules', false)
export const includeVirtual = useStorage('vite-inspect-include-virtual', false)
export const userCustomGlobPattern = useStorage('__vue-devtools-graph-glob__', '')

function getDepsByExactId(data: typeof list.value, searchId: string) {
  const result = new Set<typeof list.value[number]>()
  const queue: string[] = []
  const idToDepsMap: Record<string, string[]> = {}

  // get id to deps map
  data.forEach((item) => {
    if (item.deps.length > 0)
      idToDepsMap[item.id] = item.deps
  })

  // find referenced ids
  data.forEach((item) => {
    if (item.id === searchId || (item.id in idToDepsMap && item.deps.includes(searchId))) {
      queue.push(item.id)
      result.add(item)
    }
  })

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const referencedIds = idToDepsMap[currentId]

    if (referencedIds) {
      referencedIds.forEach((referencedId) => {
        const item = data.find(item => item.id === referencedId)!
        if (!result.has(item)) {
          queue.push(referencedId)
          result.add(item)
        }
      })
    }
  }

  return Array.from(result)
}

function uniqById(data: typeof list.value) {
  const uniqueSet = new Set<string>()
  const uniqueArray: typeof list.value = []

  for (const item of data) {
    if (!item)
      continue

    if (!uniqueSet.has(item.id)) {
      uniqueSet.add(item.id)
      uniqueArray.push(item)
    }
  }

  return uniqueArray
}

function fuzzySearchDeps(data: ModuleInfo[], text: string) {
  const fuzzySearcher = new Fuse(data, {
    ignoreLocation: true,
    keys: ['id'],
    shouldSort: true,
    threshold: 0.1,
  })
  const ids = fuzzySearcher.search(text).map(i => i.item.id)
  if (!ids.length) {
    return {
      matchedKeys: [],
      data: [],
    }
  }
  return {
    matchedKeys: ids,
    data: uniqById(ids.flatMap(id => getDepsByExactId(data, id))),
  }
}

function filterByUserDefinedGlob(data: ModuleInfo[], pattern: string) {
  if (!pattern.trim().length)
    return data
  const globPatterns = pattern.trim().split(', ')
  const globInstances = new Map(globPatterns.map(pattern => [pattern, new Minimatch(pattern, { matchBase: true, dot: true, partial: true })]))
  return data.filter(item => globPatterns.every(pattern =>
    globInstances.get(pattern)!.match(item.id),
  ))
}

const { graphSettings } = useGraphSettings()

const getDebounceTime = (len: number) => len > 85 ? 350 : 150
export const searchResults = ref<ModuleInfo[]>([])
export const matchedKeys = ref<string[]>([])

const filterer = {
  excludeNodeModules: (data: ModuleInfo[]) => {
    return includeNodeModules.value ? data : data.filter(item => !item.id.includes('/node_modules/'))
  },
  excludeVirtual: (data: ModuleInfo[]) => {
    return includeVirtual.value ? data : data.filter(item => !item.virtual)
  },
  userCustomGlobPattern: (data: ModuleInfo[], pattern: string) => {
    if (!graphSettings.value.enableUserDefinedGlob || !pattern.trim().length)
      return data
    return filterByUserDefinedGlob(data, pattern)
  },
  searchText: (data: ModuleInfo[], text: string) => {
    if (!text.trim().length) {
      matchedKeys.value = []
      return data
    }
    const { data: searchData, matchedKeys: searchMatchedKeys } = fuzzySearchDeps(data, searchText.value.trim())
    matchedKeys.value = searchMatchedKeys
    return searchData
  },
}

const allDataCanBeSearched = computed(() => {
  return filterer.excludeVirtual(
    filterer.excludeNodeModules(list.value),
  )
})

debouncedWatch([searchText, userCustomGlobPattern, allDataCanBeSearched], ([,,list]) => {
  filterData(false, list)
}, { debounce: computed(() => getDebounceTime(searchResults.value.length)) })

async function filterData(isInit = false, givenData?: ModuleInfo[]) {
  let data: ModuleInfo[] = givenData ?? []
  if (isInit)
    data = list.value = await rpc.componentGraph()
  data = filterer.searchText(
    filterer.userCustomGlobPattern(
      filterer.excludeVirtual(
        filterer.excludeNodeModules(data),
      ), userCustomGlobPattern.value)
    , searchText.value)
  searchResults.value = data
}

await filterData(true)

export async function prepareStateAnalyze() {
  await rpc.stateAnalyzePrepare()
}

export async function getAnalyzeStateResultByPath(path: string) {
  return await rpc.stateAnalyzeGetResultByPath(path)
}
