import VueIcon from '../assets/icons/vue.svg'
import PiniaIcon from '../assets/icons/pinia.svg'
import VueUseIcon from '../assets/icons/vueuse.svg'

export const data = [
  {
    id: 'vue',
    name: 'Vue.js',
    description: 'The Progressive JavaScript Framework',
    website: 'https://vuejs.org',
    github: 'https://github.com/vuejs/core',
    icon: VueIcon,
    deny: true,
    hint: 'Because of the cn.vuejs.org security setting, this will be opened from the new TAB',
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
