import { isFragment } from './util'

export function getComponentInstanceFromElement(element: any) {
  return element.__vueParentComponent
}

export function getRootElementsFromComponentInstance(instance: any) {
  if (isFragment(instance))
    return getFragmentRootElements(instance.subTree)

  if (!instance.subTree)
    return []
  return [instance.subTree.el]
}

function getFragmentRootElements(vnode: any): any[] {
  if (!vnode.children)
    return []

  const list = []

  for (let i = 0, l = vnode.children.length; i < l; i++) {
    const childVnode = vnode.children[i]
    if (childVnode.component)
      list.push(...getRootElementsFromComponentInstance(childVnode.component))

    else if (childVnode.el)
      list.push(childVnode.el)
  }

  return list
}

/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {object}
 */
export function getInstanceOrVnodeRect(instance: any): any {
  const el = instance.subTree.el

  if (typeof window === 'undefined') {
    // @TODO: Find position from instance or a vnode (for functional components).
    return
  }

  if (isFragment(instance))
    return addIframePosition(getFragmentRect(instance.subTree), getElWindow(el))

  else if (el.nodeType === 1)
    return addIframePosition(el.getBoundingClientRect(), getElWindow(el))

  else if (instance.subTree.component)
    return getInstanceOrVnodeRect(instance.subTree.component)
}

function createRect() {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width() { return rect.right - rect.left },
    get height() { return rect.bottom - rect.top },
  }
  return rect
}

function mergeRects(a: any, b: any) {
  if (!a.top || b.top < a.top)
    a.top = b.top

  if (!a.bottom || b.bottom > a.bottom)
    a.bottom = b.bottom

  if (!a.left || b.left < a.left)
    a.left = b.left

  if (!a.right || b.right > a.right)
    a.right = b.right

  return a
}

let range: any
/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */
function getTextRect(node: any) {
  if (!range)
    range = document.createRange()

  range.selectNode(node)

  return range.getBoundingClientRect()
}

function getFragmentRect(vnode: any) {
  const rect = createRect()
  if (!vnode.children)
    return rect

  for (let i = 0, l = vnode.children.length; i < l; i++) {
    const childVnode = vnode.children[i]
    let childRect
    if (childVnode.component) {
      childRect = getInstanceOrVnodeRect(childVnode.component)
    }
    else if (childVnode.el) {
      const el = childVnode.el
      if (el.nodeType === 1 || el.getBoundingClientRect)
        childRect = el.getBoundingClientRect()

      else if (el.nodeType === 3 && el.data.trim())
        childRect = getTextRect(el)
    }
    if (childRect)
      mergeRects(rect, childRect)
  }

  return rect
}

function getElWindow(el: HTMLElement) {
  return el.ownerDocument.defaultView
}

function addIframePosition(bounds: any, win: any): any {
  if (win.__VUE_DEVTOOLS_IFRAME__) {
    const rect = mergeRects(createRect(), bounds)
    const iframeBounds = win.__VUE_DEVTOOLS_IFRAME__.getBoundingClientRect()
    rect.top += iframeBounds.top
    rect.bottom += iframeBounds.top
    rect.left += iframeBounds.left
    rect.right += iframeBounds.left
    if (win.parent)
      return addIframePosition(rect, win.parent)

    return rect
  }
  return bounds
}
