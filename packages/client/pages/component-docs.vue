<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import Fuse from 'fuse.js'
import JsonEditorVue from 'json-editor-vue'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'
import { rpc } from '../logic/rpc'

const colorMode = useColorMode()
const keywords = ref('')
const activeFileIndex = ref(0)
const files = ref<string[]>([])
const content = ref({})
const list = computed(() => {
  const fuse = new Fuse(files.value, {
    shouldSort: true,
  })
  const result = keywords.value
    ? fuse.search(keywords.value).map(i => i.item)
    : (files.value || [])
  return result
})

async function getFileList() {
  files.value = await rpc.getVueSFCList()
  getComponentInfo()
}

async function getComponentInfo() {
  if (!list.value.length)
    return
  const info = await rpc.getComponentInfo(list.value[activeFileIndex.value])
  content.value = info
}

function toggle(index: number) {
  activeFileIndex.value = index
  getComponentInfo()
}

getFileList()

watch(keywords, () => {
  activeFileIndex.value = 0
  getComponentInfo()
})
</script>

<template>
  <div relative h-full of-hidden n-panel-grids>
    <div border="b base" flex="~ col gap1" px4 py3 navbar-glass>
      <VTextInput v-model="keywords" font-mono icon="carbon:search" placeholder="Filter Files" op50 />
    </div>
    <Splitpanes :style="{ height: 'calc(100% - 60px)' }">
      <Pane border="r base">
        <div h-full select-none overflow-scroll p-2 class="no-scrollbar">
          <ul v-if="list.length">
            <li
              v-for="(file, index) in list" :key="index" :class="[activeFileIndex === index ? 'op100' : 'op60']"
              hover="op100" h-8 cursor-pointer of-hidden text-ellipsis lh-8 @click="toggle(index)"
            >
              {{ file }}
            </li>
          </ul>
          <div v-else h-full flex items-center justify-center>
            <VCard flex="~ col gap2" min-w-30 items-center p3>
              <h1 text-sm italic op50>
                No Files
              </h1>
            </VCard>
          </div>
        </div>
      </Pane>
      <Pane>
        <div h-full select-none overflow-scroll p-2 class="no-scrollbar">
          <JsonEditorVue
            v-show="list.length" v-model="content" h-full class="json-editor-vue" :class="[
              colorMode === 'dark' ? 'jse-theme-dark' : '',
            ]" :main-menu-bar="false" :navigation-bar="false" :status-bar="false" :read-only="true" :indentation="2"
            :tab-size="2"
          />
          <div v-show="!list.length" h-full flex items-center justify-center>
            <VCard flex="~ col gap2" min-w-30 items-center p3>
              <h1 text-sm italic op50>
                No Data
              </h1>
            </VCard>
          </div>
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
