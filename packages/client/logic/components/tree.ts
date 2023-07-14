import type { ComponentInternalInstance, SuspenseBoundary } from 'vue'
import { getInstanceName, getRenderKey, getUniqueComponentId, isBeingDestroyed, isFragment } from './util'
import { ComponentFilter } from './filter'
import { getRootElementsFromComponentInstance } from './el'
import { getInstanceState } from './data'

export const InstanceMap = new Map()
export class ComponentWalker {
  maxDepth: number
  recursively: boolean
  componentFilter: ComponentFilter
  // Dedupe instances
  // Some instances may be both on a component and on a child abstract/functional component
  captureIds: Map<string, undefined>

  constructor(maxDepth: number, filter: string | null, recursively: boolean) {
    this.maxDepth = maxDepth
    this.recursively = recursively
    this.componentFilter = new ComponentFilter(filter)
    this.captureIds = new Map()
  }

  getComponentTree(instance: ComponentInternalInstance): Promise<any[]> {
    this.captureIds = new Map()
    return this.findQualifiedChildren(instance, 0)
  }

  getComponentParents(instance: ComponentInternalInstance) {
    this.captureIds = new Map()
    const parents = []
    this.captureId(instance)
    let parent = instance
    // eslint-disable-next-line no-cond-assign
    while ((parent = parent.parent!)) {
      this.captureId(parent)
      parents.push(parent)
    }
    return parents
  }

  /**
   * Find qualified children from a single instance.
   * If the instance itself is qualified, just return itself.
   * This is ok because [].concat works in both cases.
   *
   * @param {Vue|Vnode} instance
   * @return {Vue|Array}
   */
  private async findQualifiedChildren(instance: any, depth: number): Promise<unknown[]> {
    if (this.componentFilter.isQualified(instance) && !instance.type.devtools?.hide) {
      return [await this.capture(instance, [], depth)]
    }
    else if (instance.subTree) {
      // TODO functional components
      const list = this.isKeepAlive(instance)
        ? this.getKeepAliveCachedInstances(instance)
        : this.getInternalInstanceChildren(instance.subTree)
      return this.findQualifiedChildrenFromList(list, depth)
    }
    else {
      return []
    }
  }

  /**
   * Iterate through an array of instances and flatten it into
   * an array of qualified instances. This is a depth-first
   * traversal - e.g. if an instance is not matched, we will
   * recursively go deeper until a qualified child is found.
   *
   * @param {Array} instances
   * @return {Array}
   */
  private async findQualifiedChildrenFromList(instances: ComponentInternalInstance[], depth: number): Promise<unknown[]> {
    instances = instances
      .filter(child => !isBeingDestroyed(child))
    if (!this.componentFilter.filter)
      return Promise.all(instances.map((child, index, list) => this.capture(child, list, depth)))

    else
      return Array.prototype.concat.apply([], await Promise.all(instances.map(i => this.findQualifiedChildren(i, depth))))
  }

  /**
   * Get children from a component instance.
   */
  private getInternalInstanceChildren(subTree: ComponentInternalInstance['subTree'] | null, suspense: SuspenseBoundary & { suspenseKey?: string } | null = null): ComponentInternalInstance[] {
    const list = []
    if (subTree) {
      if (subTree.component) {
        !suspense ? list.push(subTree.component) : list.push({ ...subTree.component, suspense })
      }
      else if (subTree.suspense) {
        const suspenseKey: string = !subTree.suspense.isInFallback ? 'suspense default' : 'suspense fallback'
        list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch, { ...subTree.suspense, suspenseKey }))
      }
      else if (Array.isArray(subTree.children)) {
        subTree.children.forEach((childSubTree: any) => {
          if (childSubTree?.component)
            !suspense ? list.push(childSubTree.component) : list.push({ ...childSubTree.component, suspense })

          else
            list.push(...this.getInternalInstanceChildren(childSubTree, suspense))
        })
      }
    }
    return list.filter(child => !isBeingDestroyed(child))
  }

  private captureId(instance: ComponentInternalInstance | null): null | string {
    if (!instance)
      return null

    const id = getUniqueComponentId(instance)

    // Dedupe
    if (this.captureIds.has(id))
      return null

    else
      this.captureIds.set(id, undefined)

    return id
  }

  /**
   * Capture the meta information of an instance. (recursive)
   *
   * @param {Vue} instance
   * @return {Object}
   */
  private async capture(instance: ComponentInternalInstance, list: any[], depth: number): Promise<any> {
    if (!instance)
      return null

    const id = this.captureId(instance)

    const name = getInstanceName(instance)

    const children = this.getInternalInstanceChildren(instance.subTree)
      .filter(child => !isBeingDestroyed(child))

    const parents = this.getComponentParents(instance) || []

    const inactive = !!instance.isDeactivated || parents.some(parent => parent.isDeactivated)

    const treeNode: any = {
      uid: instance.uid,
      id,
      name,
      renderKey: getRenderKey(instance.vnode ? instance.vnode.key : null),
      inactive,
      hasChildren: !!children.length,
      children: [],
      isFragment: isFragment(instance),
      // TODO: functional components, suspense
      tags: [],
      autoOpen: this.recursively,
      instance: null,
    }

    const uids: number[] = []

    // capture children
    if (depth < this.maxDepth || (instance.type as any).__isKeepAlive || parents.some(parent => (parent.type as any).__isKeepAlive)) {
      treeNode.children = await Promise.all(children
        .map((child, index, list) => this.capture(child, list, depth + 1))
        .filter(Boolean))
      uids.push(...treeNode.children.map((child: any) => child.uid))
    }

    // keep-alive
    if (this.isKeepAlive(instance)) {
      const cachedComponents = this.getKeepAliveCachedInstances(instance)
      for (const cachedChild of cachedComponents) {
        const node = await this.capture({ ...cachedChild, isDeactivated: true }, [], depth + 1)
        const uid = node.uid
        if (node && !uids.includes(uid))
          treeNode.children.push(node)
      }
    }

    // ensure correct ordering
    const rootElements = getRootElementsFromComponentInstance(instance)
    const firstElement = rootElements[0]
    if (firstElement?.parentElement) {
      const parentInstance = instance.parent
      const parentRootElements = parentInstance ? getRootElementsFromComponentInstance(parentInstance) : []
      let el = firstElement
      const indexList = []
      do {
        indexList.push(Array.from(el.parentElement.childNodes).indexOf(el))
        el = el.parentElement
      } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el))
      treeNode.domOrder = indexList.reverse()
    }
    else {
      treeNode.domOrder = [-1]
    }

    // if (instance.suspense?.suspenseKey) {
    //   treeNode.tags.push({
    //     label: instance.suspense.suspenseKey,
    //   })
    // }

    InstanceMap.set(treeNode.id, getInstanceState(instance))
    treeNode.instance = instance

    return treeNode
  }

  private isKeepAlive(instance: any) {
    return instance.type.__isKeepAlive && instance.__v_cache
  }

  private getKeepAliveCachedInstances(instance: any) {
    return Array.from(instance.__v_cache.values()).map((vnode: any) => vnode.component).filter(Boolean)
  }
}
