import fs from 'node:fs/promises'
import p from 'node:path'
import fg from 'fast-glob'
import { join, resolve } from 'pathe'
import type { ResolvedConfig } from 'vite'
import { imageMeta } from 'image-meta'
import type { AssetInfo, AssetType, ImageMeta } from '../../types'

const _imageMetaCache = new Map<string, ImageMeta | undefined>()

function guessType(path: string): AssetType {
  if (/\.(a?png|jpe?g|gif|svg|webp|avif|ico|bmp|tiff?)$/i.test(path))
    return 'image'
  if (/\.(mp4|webm|ogv|mov|avi|flv|wmv|mpg|mpeg|mkv|3gp|3g2|ts|mts|m2ts|vob|ogm|ogx|rm|rmvb|asf|amv|divx|m4v|svi|viv|f4v|f4p|f4a|f4b)$/i.test(path))
    return 'video'
  if (/\.(mp3|wav|ogg|flac|aac|wma|alac|ape|ac3|dts|tta|opus|amr|aiff|au|mid|midi|ra|rm|wv|weba|dss|spx|vox|tak|dsf|dff|dsd|cda)$/i.test(path))
    return 'audio'
  if (/\.(woff2?|eot|ttf|otf|ttc|pfa|pfb|pfm|afm)/i.test(path))
    return 'font'
  if (/\.(json[5c]?|te?xt|[mc]?[jt]sx?|md[cx]?|markdown)/i.test(path))
    return 'text'
  return 'other'
}

export async function getStaticAssets(config: ResolvedConfig): Promise<AssetInfo[]> {
  const dir = resolve(config.root)
  const baseURL = config.base

  const files = await fg([
    // image
    '**/*.(png|jpg|jpeg|gif|svg|webp|avif|ico|bmp|tiff)',
    // video
    '**/*.(mp4|webm|ogv|mov|avi|flv|wmv|mpg|mpeg|mkv|3gp|3g2|m2ts|vob|ogm|ogx|rm|rmvb|asf|amv|divx|m4v|svi|viv|f4v|f4p|f4a|f4b)',
    // audio
    '**/*.(mp3|wav|ogg|flac|aac|wma|alac|ape|ac3|dts|tta|opus|amr|aiff|au|mid|midi|ra|rm|wv|weba|dss|spx|vox|tak|dsf|dff|dsd|cda)',
    // font
    '**/*.(woff2?|eot|ttf|otf|ttc|pfa|pfb|pfm|afm)',
    // text
    '**/*.(json|json5|jsonc|txt|text|tsx|jsx|md|mdx|mdc|markdown)',
  ], {
    cwd: dir,
    onlyFiles: true,
    ignore: ['**/node_modules/**', '**/dist/**'],
  })

  return await Promise.all(files.map(async (path) => {
    const filePath = resolve(dir, path)
    const stat = await fs.lstat(filePath)
    const publicDirname = p.relative(config.root, config.publicDir)
    const normalizedPath = publicDirname === p.basename(p.dirname(path)) ? path.replace(publicDirname, '') : path
    return {
      path: normalizedPath,
      filePath,
      publicPath: join(baseURL, normalizedPath),
      type: guessType(path),
      size: stat.size,
      mtime: stat.mtimeMs,
    }
  }))
}

export async function getImageMeta(filepath: string) {
  if (_imageMetaCache.has(filepath))
    return _imageMetaCache.get(filepath)
  try {
    const meta = imageMeta(await fs.readFile(filepath)) as ImageMeta
    _imageMetaCache.set(filepath, meta)
    return meta
  }
  catch (e) {
    _imageMetaCache.set(filepath, undefined)
    console.error(e)
    return undefined
  }
}

export async function getTextAssetContent(filepath: string, limit = 300) {
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    return content.slice(0, limit)
  }
  catch (e) {
    console.error(e)
    return undefined
  }
}
