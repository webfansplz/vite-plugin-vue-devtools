import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DIR_DIST = typeof __dirname !== 'undefined'
  ? __dirname
  : dirname(fileURLToPath(import.meta.url))

export const DIR_CLIENT = resolve(DIR_DIST, '../dist/client')

export const ICON = `
<svg viewBox="0 0 256 198" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#41B883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0h47.36Z" />
  <path fill="#41B883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0H0Z" />
  <path fill="#35495E" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0H50.56Z" />
</svg>
`
