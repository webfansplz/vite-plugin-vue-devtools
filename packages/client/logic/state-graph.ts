import type { AcceptableLang } from 'esm-analyzer'
import { Project } from 'esm-analyzer'
import { rpc } from './rpc'

const rawData = ref<{
  code: string
  lang: AcceptableLang
  path: string
}[]>([])
const project = shallowRef<Project>(new Project('state-analyze'))
const isReady = ref(false)

export async function initRawData() {
  if (isReady.value)
    return
  rawData.value = (await rpc.getStateAnalyzeCollectedData()).map(item => ({
    code: item.code,
    lang: item.lang as AcceptableLang,
    path: item.filename,
  }))
  project.value.addFiles(rawData.value)
  await project.value.prepare()
  isReady.value = true
}

export function useStateGraph() {
  const [drawerVisible, toggleDrawerVisible] = useToggle(false)

  return {
    drawerVisible,
    toggleDrawerVisible,
    enable: async () => {
      toggleDrawerVisible()
      const data = await initRawData()
      console.log({ data })
    },
  }
}
