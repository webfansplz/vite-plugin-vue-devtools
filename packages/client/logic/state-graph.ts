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

const codeData = ref<{
  code: string
  filename: string
}[]>([])
const rawAnalyzeData = ref<{
  code: string
  lang: AcceptableLang
  path: string
  offsetContent: string
}[]>([])
const project = shallowRef<Project>(new Project('state-analyze'))
export const stateGraphState = ref(StateGraphStateEnum.NOT_READY)

export async function initRawData() {
  if (stateGraphState.value !== StateGraphStateEnum.NOT_READY)
    return
  const rawData = await rpc.getStateAnalyzeCollectedData() ?? []
  rawData.forEach((item) => {
    rawAnalyzeData.value.push({
      code: item.code,
      lang: item.lang as AcceptableLang,
      path: item.filename,
      offsetContent: item.offsetContent,
    })
    codeData.value.push({
      code: item.fullCode,
      filename: item.filename,
    })
  })
  project.value.addFiles(rawAnalyzeData.value)
  await project.value.prepare()
  stateGraphState.value = StateGraphStateEnum.READY
}

const currentSelectedFile = ref</* file name */string>()
watch(currentSelectedFile, () => {
  stateGraphState.value = getState()
})

export function useStateGraph() {
  const [drawerVisible, toggleDrawerVisible] = useToggle(false)

  return {
    drawerVisible,
    toggleDrawerVisible,
    enable: async () => {
      toggleDrawerVisible()
      await initRawData()
      stateGraphState.value = getState()
    },
    currentSelectedFile,
  }
}

function getState() {
  // if not ready
  if (stateGraphState.value === StateGraphStateEnum.NOT_READY)
    return StateGraphStateEnum.NOT_READY
  const selectFile = currentSelectedFile.value
  // if not selected file
  if (!selectFile)
    return StateGraphStateEnum.NOT_SELECT_FILE
  // if not collected
  if (!project.value.getFilePaths().includes(selectFile))
    return StateGraphStateEnum.NOT_COLLECTED
  // if no state
  const data = project.value.getAnalyzeResults(selectFile)
  if (!data || !data.size)
    return StateGraphStateEnum.NO_STATE
  return StateGraphStateEnum.HAS_STATE
}

function getData() {
  return stateGraphState.value === StateGraphStateEnum.HAS_STATE
    ? project.value.getAnalyzeResults(currentSelectedFile.value!)!
    : null
}

export const stateGraphRawData = computed(() => {
  return getData()
})

export const currentFullCodeAndFilename = computed(() => {
  return codeData.value.find(item => item.filename === currentSelectedFile.value) ?? {
    code: '',
    filename: '',
  }
})
