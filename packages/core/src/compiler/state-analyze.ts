type StateAnalyzeCollected = {
  code: string
  filename: string
  lang: string
}[]

const stateAnalyzeCollectedData: StateAnalyzeCollected = []

export function collect(code: string, filename: string, lang: string) {
  stateAnalyzeCollectedData.push({
    code,
    filename,
    lang,
  })
}

export function getStateAnalyzeCollectedData() {
  return stateAnalyzeCollectedData
}
