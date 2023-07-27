import type { ComponentInternalInstance } from 'vue'
import { classify, getInstanceName, kebabize } from './util'

export class ComponentFilter {
  private filter: string

  constructor(filter: string | null) {
    this.filter = filter || ''
  }

  /**
   * Check if an instance is qualified.
   *
   * @param {Vue|Vnode} instance
   * @return {Boolean}
   */
  isQualified(instance: ComponentInternalInstance) {
    const name = getInstanceName(instance)
    return classify(name).toLowerCase().includes(this.filter)
      || kebabize(name).toLowerCase().includes(this.filter)
  }

  setFilter(filter: string) {
    this.filter = filter
  }
}
