import { rpc } from '../logic/rpc'
import type { ModuleInfo } from '../../types'
import { initPages, routes } from './pages'

initPages()
const modules = ref<ModuleInfo[]>(await rpc.componentGraph())
const vueModules = computed(() => modules.value.filter(i => i.id.match(/\.vue($|\?v=)/)))
export const pageCount = computed(() => routes.value.length)
export const componentCount = computed(() => vueModules.value.length - pageCount.value)
// const vueModules = modules.filter(i => i.id.match(/\.vue($|\?v=)/))
