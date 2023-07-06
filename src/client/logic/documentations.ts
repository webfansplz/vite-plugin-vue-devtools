import VueIcon from '../assets/icons/vue.svg'
import PiniaIcon from '../assets/icons/pinia.svg'
import VueUseIcon from '../assets/icons/vueuse.svg'
import type { DocumentInfo } from '../../types'
export const data: DocumentInfo[] = reactive([
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
])


export function addDoc(docInfo?) {
  data.push({
    id: 'hh',
    name: 'hahha',
    website: 'https://element-plus.org/zh-CN/component/button.html'
  })
}
