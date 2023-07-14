import type { ModuleInfo } from '../../types'
import { rpc } from './rpc'
import { routes } from './app'

const modules = ref<ModuleInfo[]>(await rpc.componentGraph())
const vueModules = computed(() => modules.value.filter(i => i.id.match(/\.vue($|\?v=)/)))
export const pageCount = computed(() => routes.value.length)
export const componentCount = computed(() => vueModules.value.length)
// const vueModules = modules.filter(i => i.id.match(/\.vue($|\?v=)/))
