import type { AcceptableLang } from 'esm-analyzer'
import { Project } from 'esm-analyzer'
import { rpc } from './rpc'

export enum StateGraphStateEnum {
  NOT_READY, // graph is not ready yet
  READY, // graph is ready
  NOT_SELECT_FILE, // graph is ready, but no file is selected
  NOT_COLLECTED, // graph is ready, but the selected file is not collected
  NO_STATE, // graph is ready, but the selected file has no state
  HAS_STATE, // everything is ready
}

const rawData = ref<{
  code: string
  lang: AcceptableLang
  path: string
}[]>([])
const project = shallowRef<Project>(new Project('state-analyze'))
export const stateGraphState = ref(StateGraphStateEnum.NOT_READY)

export async function initRawData() {
  if (stateGraphState.value !== StateGraphStateEnum.NOT_READY)
    return
  rawData.value = (await rpc.getStateAnalyzeCollectedData()).map(item => ({
    code: item.code,
    lang: item.lang as AcceptableLang,
    path: item.filename,
  }))
  project.value.addFiles(rawData.value)
  await project.value.prepare()
  stateGraphState.value = StateGraphStateEnum.READY
}

const currentSelectedFile = ref</* file name */string>()

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
    currentSelectedFile,
  }
}

function startAnalyze() {
  // if not ready
  if (stateGraphState.value === StateGraphStateEnum.NOT_READY)
    return { state: StateGraphStateEnum.NOT_READY, data: null }
  const selectFile = currentSelectedFile.value
  // if not selected file
  if (!selectFile)
    return { state: StateGraphStateEnum.NOT_SELECT_FILE, data: null }
  // if not collected
  if (!project.value.getFilePaths().includes(selectFile))
    return { state: StateGraphStateEnum.NOT_COLLECTED, data: null }
  // if no state
  const data = project.value.getAnalyzeResults(selectFile)
  if (!data || !data.size)
    return { state: StateGraphStateEnum.NO_STATE, data: null }
  return { state: StateGraphStateEnum.HAS_STATE, data }
}

export const stateGraphRawData = computed(() => {
  const { data, state } = startAnalyze()
  stateGraphState.value = state
  return data
})
