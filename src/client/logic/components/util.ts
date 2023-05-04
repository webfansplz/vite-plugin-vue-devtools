import { Fragment } from 'vue'
import type { ComponentInternalInstance } from 'vue'

export function isBeingDestroyed(instance: ComponentInternalInstance & { _isBeingDestroyed?: boolean }) {
  return instance._isBeingDestroyed || instance.isUnmounted
}

export function isFragment(instance: ComponentInternalInstance) {
  return Fragment === instance.subTree?.type
}

/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
export function getInstanceName(instance: any) {
  const name = getComponentTypeName(instance.type || {})
  if (name)
    return name
  if (instance.root === instance)
    return 'Root'
  for (const key in instance.parent?.type?.components) {
    if (instance.parent.type.components[key] === instance.type)
      return saveComponentName(instance, key)
  }

  for (const key in instance.appContext?.components) {
    if (instance.appContext.components[key] === instance.type)
      return saveComponentName(instance, key)
  }

  const fileName = getComponentFileName(instance.type || {})
  if (fileName)
    return fileName

  return 'Anonymous Component'
}

function saveComponentName(instance: ComponentInternalInstance, key: string) {
  return key
}

function getComponentTypeName(options: any) {
  return options.name || options._componentTag || options.__vdevtools_guessedName || options.__name
}

export function getComponentFileName(options: any) {
  const file = options.__file // injected by vite
  // TODO: classify
  if (file) {
    const filename = options.__file?.match(/\/?([^/]+?)(\.[^/.]+)?$/)?.[1]
    return filename ?? file
  }
  // return classify(basename(file, '.vue'))
}

/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
export function getUniqueComponentId(instance: any) {
  // console.log('file', instance, instance.type.__file ?? `${instance.type.name}${instance.uid}`)
  // TODO: unique id for root
  const appId = 'vue-devtools'
  const instanceId = instance === instance.root ? 'root' : instance.uid
  return `${appId}:${instanceId}`
}

export function getRenderKey(value: unknown): number | string | null {
  if (value == null)
    return null
  const type = typeof value
  if (type === 'number')
    return value as number

  else if (type === 'string')
    return `'${value}'`

  else if (Array.isArray(value))
    return 'Array'

  else
    return 'Object'
}

export function getComponentInstances(app: any): any[] {
  const appRecord = app.__VUE_DEVTOOLS_APP_RECORD__
  const appId = appRecord.id.toString()
  return [...appRecord.instanceMap]
    .filter(([key]) => key.split(':')[0] === appId)
    .map(([, instance]) => instance)
}

export function cached(fn: (str: string) => string) {
  const cache = Object.create(null)
  return function cachedFn(str: string) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}
export function toUpper(_: unknown, c: string) {
  return c ? c.toUpperCase() : ''
}
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string) => {
  return str && str.replace(camelizeRE, toUpper)
})
const kebabizeRE = /([a-z0-9])([A-Z])/g
export const kebabize = cached((str: string) => {
  return str && str
    .replace(kebabizeRE, (_, lowerCaseCharacter, upperCaseLetter) => {
      return `${lowerCaseCharacter}-${upperCaseLetter}`
    })
    .toLowerCase()
})

export function returnError(cb: () => any) {
  try {
    return cb()
  }
  catch (e) {
    return e
  }
}
const classifyRE = /(?:^|[-_/])(\w)/g
export const classify = cached((str) => {
  // fix: str.replace may causes '"replace" is not a function' exception.
  // This bug may causes the UI 'Component Filter' to not work properly
  // e.g. The type of 'str' is Number.
  // So need cover 'str' to String.
  return str && (`${str}`).replace(classifyRE, toUpper)
})
