import type { ComponentInternalInstance } from 'vue'

export function getComponentTypeName(options: any) {
  return options.name || options._componentTag || options.__vdevtools_guessedName || options.__name
}

function saveComponentName(instance: ComponentInternalInstance, key: string) {
  return key
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
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {string}
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
