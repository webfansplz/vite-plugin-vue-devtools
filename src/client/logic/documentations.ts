import VueIcon from '../assets/icons/vue.svg'
import PiniaIcon from '../assets/icons/pinia.svg'
import VueUseIcon from '../assets/icons/vueuse.svg'
import type { DocumentInfo } from '../../types'
import { DOC_GROUP_KEY } from '../constants'

const normalData: DocumentInfo[] = [
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'The Progressive JavaScript Framework',
    website: 'https://vuejs.org',
    github: 'https://github.com/vuejs/core',
    icon: VueIcon,
    openInBlank: true,
    tips: 'Unable to embed it due to the security settings',
  },
  {
    id: 'vue-router',
    name: 'Vue Router',
    description: 'The official Router for Vue.js',
    website: 'https://router.vuejs.org',
    github: 'https://github.com/vuejs/router',
    icon: VueIcon,
  },
  {
    id: 'pinia',
    name: 'Pinia',
    description: 'The intuitive store for Vue.js',
    website: 'https://pinia.vuejs.org',
    github: 'https://github.com/vuejs/pinia',
    icon: PiniaIcon,
  },
  {
    id: '@vueuse/core',
    name: 'VueUse',
    description: 'Collection of essential Vue Composition Utilities for Vue 2 and 3',
    website: 'https://vueuse.org',
    github: 'https://github.com/vueuse/vueuse',
    icon: VueUseIcon,
  },
]

const localData = [...normalData]

export const data = useLocalStorage(DOC_GROUP_KEY, localData)

export function addDoc(docInfo: DocumentInfo) {
  data.value.push(docInfo)
}

export function removeDoc(id: string) {
  const idx = data.value.findIndex(i => i.id === id)
  data.value.splice(idx, 1)
}

export function resetDoc() {
  data.value = normalData
}
