import { parse } from 'node:url'
import { existsSync } from 'node:fs'
import launchEditor from 'launch-editor'
import type { Connect } from 'vite'

export const launchEditorHandler: Connect.HandleFunction = (req, res) => {
  const { file } = parse(req.url || '', true).query
  const files = Array.isArray(file) ? file : [file]
  files.forEach((fileItem) => {
    if (!fileItem || !existsSync(fileItem)) {
      res.statusCode = 404
      res.end(`launch-editor-middleware: can not open file ${fileItem}`)
    }
    else {
      launchEditor(file)
      res.end('launch-editor-middleware: open in editor')
    }
  })
}
