import type { ComponentResolver } from 'unplugin-vue-components'

export interface ComponentResolverOption {
  /**
   * Prefix for resolving components name.
   * Set '' to disable prefix.
   *
   * @default 'VD'
   */
  prefix?: string
}

export function ComponentsResolver(options: ComponentResolverOption = {}): ComponentResolver {
  return (name: string) => {
    const {
      prefix = options.prefix ?? 'VD',
    } = options

    if (!name.startsWith(prefix))
      return

    return { from: `@vite-plugin-vue-devtools/ui-kit/components/${name.replace(prefix, '')}.vue` }
  }
}
