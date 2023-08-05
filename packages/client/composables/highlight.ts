import type { Highlighter } from 'shiki'
import { getHighlighter, setCDN } from 'shiki'

const extToLang = {
  vue: 'vue',
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
}

setCDN('https://unpkg.com/shiki/')

let highlighter: Highlighter

async function initHighlighter() {
  if (highlighter)
    return highlighter
  return await getHighlighter({
    themes: ['vitesse-dark', 'vitesse-light'],
    langs: ['vue', 'javascript', 'typescript', 'jsx', 'tsx'],
  }).then(h => highlighter = h)
}

export async function useHighlight() {
  const isDark = useDark()
  if (!highlighter)
    await initHighlighter()
  return {
    highlightedCode: (code: string, ext: string) => highlighter.codeToHtml(code,
      {
        lang: extToLang[ext],
        theme: isDark.value ? 'vitesse-dark' : 'vitesse-light',
      },
    ),
  }
}
