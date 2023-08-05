type StateAnalyzeCollected = {
  code: string
  filename: string
  lang: string
  offsetContent: string
  fullCode: string
}[]

const stateAnalyzeCollectedData: StateAnalyzeCollected = []

export function collect(code: string, filename: string, lang: string, offsetContent: string, fullCode: string) {
  stateAnalyzeCollectedData.push({
    code,
    filename,
    lang,
    offsetContent,
    fullCode,
  })
}

export function getStateAnalyzeCollectedData() {
  return stateAnalyzeCollectedData
}
