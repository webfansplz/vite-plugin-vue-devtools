<script setup lang="ts">
import algoliasearch from 'algoliasearch'
import type { SearchResponse } from '@algolia/client-search'
import type { PackageInfo, PackageMeta } from '../../types'
import { rpc } from '../logic/rpc'
import { hookApi } from '../logic/hook'

const algolia = {
  appId: 'OFCNCOG2CU',
  apiKey: 'f54e21fa3a2a0160595bb058179bfb1e',
  indexName: 'npm-search',
}

const client = algoliasearch(algolia.appId, algolia.apiKey).initIndex(
  algolia.indexName,
)

const keywords = ref('')
const responseTime = ref(0)
const total = ref(0)
const page = ref(0)
const el = ref<HTMLElement | null>(null)
const terminalVisible = ref(false)
const list = ref<SearchResponse<PackageInfo>['hits']>([])

const projectDeps = ref<PackageMeta[]>([])
const locked = useScrollLock(el)

const projectDepsVisible = ref(false)
const packageListVisible = ref(true)

function toThousands(num: number): string {
  return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
}

function toggleVersion(item: PackageInfo, version: string) {
  item.activeVersion = version
}

async function download(item: PackageInfo, isDev: boolean) {
  terminalVisible.value = true
  locked.value = true
  rpc.installPackage([`${item.name}@${item.activeVersion ?? item.version}`], { isDev })
  hookApi.hook.on('__vue-devtools:terminal:exit__', () => {
    setTimeout(() => {
      terminalVisible.value = false
      locked.value = false
    }, 2000)
  })
}

async function uninstall(item: PackageMeta, type: string) {
  const isDev = type !== 'dependencies'
  terminalVisible.value = true
  locked.value = true
  rpc.uninstallPackage([`${item.name}`], { isDev })
  hookApi.hook.on('__vue-devtools:terminal:exit__', () => {
    setTimeout(() => {
      terminalVisible.value = false
      locked.value = false
      getProjectDeps()
    }, 2000)
  })
}

async function search(query: string) {
  const res = await client.search<PackageInfo>(query, {
    attributesToRetrieve: [
      'name',
      'version',
      'description',
      'owner',
      'repository',
      'humanDownloadsLast30Days',
      'versions',
    ],
    page: page.value,
    hitsPerPage: 20,
  })
  responseTime.value = res.processingTimeMS
  total.value = res.nbHits
  list.value = page.value ? list.value.concat(res.hits) : res.hits
}

function getProjectDeps() {
  rpc.getPackages().then((res) => {
    projectDeps.value = Object.keys(res.packages).map((key) => {
      return {
        name: key,
        version: res.packages[key].version,
        type: res.packages[key].type,
      }
    })
  })
}
getProjectDeps()

watch(keywords, (value) => {
  page.value = 0
  el.value?.scrollTo({
    top: 0,
  })
  packageListVisible.value = true
  projectDepsVisible.value = false
  search(value)
}, {
  immediate: true,
})

useInfiniteScroll(
  el,
  () => {
    if (list.value.length >= total.value || !packageListVisible.value)
      return
    page.value++
    search(keywords.value)
  },
  { distance: 10 },
)
</script>

<template>
  <div ref="el" relative h-full of-auto n-panel-grids>
    <div border="b base" flex="~ col gap1" px4 py3 navbar-glass>
      <VTextInput v-model="keywords" font-mono icon="carbon:search" placeholder="Search packages" op50 />
    </div>
    <VSectionBlock
      v-model:open="projectDepsVisible" text="Project dependencies"
      :description="`found ${toThousands(projectDeps.length)} packages`" padding="0"
    >
      <div max-h="80%" of-hidden px-4>
        <table w-full>
          <thead border="b base">
            <tr>
              <th text-left>
                Name
              </th>
              <th text-left>
                Version
              </th>
              <th text-center>
                Type
              </th>
              <th text-center>
                Uninstall
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in projectDeps" :key="index" class="group" h-7
              border="b dashed transparent hover:base"
            >
              <td text-sm op70>
                <div flex="inline gap3" items-center>
                  {{ item.name }}
                </div>
              </td>
              <td text-sm op70>
                <div flex="inline gap3" items-center>
                  {{ item.version }}
                </div>
              </td>
              <td flex justify-center text-sm op70>
                <div>
                  {{ item.type }}
                </div>
              </td>
              <td w-30 text-center>
                <VDropdown placement="bottom" :distance="5" text-center>
                  <VButton icon="carbon:trash-can m0 text-xs" py-1 />
                  <template #popper>
                    <VButton v-close-popper py-1 @click="uninstall(item, item.type)">
                      Confirm
                    </VButton>
                    <VButton v-close-popper py-1>
                      Cancel
                    </VButton>
                  </template>
                </VDropdown>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VSectionBlock>
    <VSectionBlock
      v-model:open="packageListVisible" text="Search Results"
      :description="`found ${toThousands(total)} packages in ${responseTime}ms`" padding="0"
    >
      <div max-h="80%" of-hidden px-4>
        <table w-full>
          <thead border="b base">
            <tr>
              <th text-left>
                Name
              </th>
              <th text-left>
                Version
              </th>
              <th text-left>
                Author
              </th>
              <th text-left>
                Downloads
              </th>
              <th text-center>
                Download
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in list" :key="index" class="group" h-7 border="b dashed transparent hover:base">
              <td text-sm op70>
                <div flex="inline gap3" items-center>
                  <template v-if="item?.repository?.url">
                    <a :href="item.repository.url" target="_blank" hover="text-primary">
                      {{ item.name }}
                    </a>
                  </template>
                  <template v-else>
                    {{ item.name }}
                  </template>
                </div>
              </td>
              <VDropdown max-w="10" placement="bottom-start" :distance="5">
                <td
                  hover="text-primary"
                  h-7 cursor-pointer ws-nowrap pr-1 text-left text-sm lh-7 font-mono underline op70
                >
                  {{ item.activeVersion ?? item.version }}
                </td>
                <template #popper>
                  <ul max-h="35" of-scroll py-3>
                    <li
                      v-for="(version) in Object.keys(item.versions).reverse()" :key="version" v-close-popper
                      border="b dashed transparent" class="group" hover="bg-active"
                      :class="String(item.activeVersion ?? item.version) === version ? 'text-primary' : ''" h-7
                      cursor-pointer px-3 text-center lh-7 @click="toggleVersion(item, version)"
                    >
                      {{ version }}
                    </li>
                  </ul>
                </template>
              </VDropdown>
              <td w-30 ws-nowrap pr-1 text-left text-sm font-mono underline op70 hover="text-primary">
                <a :href="item?.owner?.link" target="_blank">
                  {{ item?.owner?.name ?? '-' }}
                </a>
              </td>
              <td w-30 ws-nowrap pr-1 text-left text-sm font-mono op70>
                {{ item.humanDownloadsLast30Days }}
              </td>
              <td w-30 text-center>
                <VDropdown placement="bottom" :distance="5" text-center>
                  <VButton icon="carbon-download m0 text-xs" py-1 />
                  <template #popper>
                    <VButton v-close-popper py-1 @click="download(item, true)">
                      Dev
                    </VButton>
                    <VButton v-close-popper py-1 @click="download(item, false)">
                      Prod
                    </VButton>
                  </template>
                </VDropdown>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VSectionBlock>
    <TerminalView v-if="terminalVisible" absolute left-0 top-0 z-1000 h-full w-full />
  </div>
</template>
