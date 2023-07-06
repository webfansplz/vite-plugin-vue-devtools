import { useStorage } from '@vueuse/core'
import Fuse from 'fuse.js'
import { Minimatch } from 'minimatch'
import type { ModuleInfo } from '../../types'
import { rpc } from './rpc'

export const list = ref<ModuleInfo[]>(await rpc.componentGraph())
export const searchText = useStorage('vite-inspect-search-text', '')
export const includeNodeModules = useStorage('vite-inspect-include-node-modules', false)
export const includeVirtual = useStorage('vite-inspect-include-virtual', false)
export const rootPath = ref(await rpc.root())
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

function fuzzySearchDeps(data: typeof list.value, id: string) {
  const fuzzySearcher = new Fuse(data, {
    ignoreLocation: true,
    keys: ['id'],
    shouldSort: true,
    threshold: 0.1,
  })
  const result = fuzzySearcher.search(id).map(i => i.item)
  if (!result) {
    return {
      main: [],
      allWithDeps: [],
    }
  }
  return {
    main: result,
    allWithDeps: uniqById(result.flatMap(item => getDepsByExactId(data, item.id))),
  }
}

function filterByUserDefinedGlob(data: typeof list.value) {
  if (!userCustomGlobPattern.value.trim().length)
    return data
  const globPattern = userCustomGlobPattern.value.trim().split(', ')
  const globInstances = new Map(globPattern.map(pattern => [pattern, new Minimatch(pattern, { matchBase: true })]))
  return data.filter(item => globPattern.every(pattern =>
    globInstances.get(pattern)!.match(item.id),
  ))
}

const { graphSettings } = useGraphSettings()

export const searchResults = computed(() => {
  let data = (
    list.value
  ) || []

  if (!includeNodeModules.value)
    data = data.filter(item => !item.id.includes('/node_modules/'))
  if (!includeVirtual.value)
    data = data.filter(item => !item.virtual)

  if (graphSettings.value.enableUserDefinedGlob)
    data = filterByUserDefinedGlob(data)

  if (!searchText.value) {
    return {
      main: [],
      data,
    }
  }

  const { main, allWithDeps } = fuzzySearchDeps(data, searchText.value.trim())
  return {
    main,
    data: allWithDeps,
  }
})
