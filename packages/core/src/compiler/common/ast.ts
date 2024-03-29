import type { BlockStatement, CallExpression, Node, ObjectMethod, ObjectProperty } from '@babel/types'
import type { WalkerContext } from 'estree-walker/types/walker'
import { walk } from 'estree-walker'
import type { InsertLocation } from './parse'

export type WalkCallback = (this: WalkerContext, node: Node, parent: Node | null, key: string | number | symbol | null | undefined, index: number | null | undefined) => void

export async function walkAST(node: Node, handlers: {
  enter?: WalkCallback
  leave?: WalkCallback
}): Promise<Node | null> {
  // @ts-expect-error estree-walker types are not compatible with babel types
  return walk(node, handlers)
}

function getNodeEndAndFilterReturn(node: BlockStatement): InsertLocation['end'] {
  let end = node.end ?? 0
  for (const stmt of node.body) {
    if (stmt.type === 'ReturnStatement') {
      end = stmt.start ?? 0
      break
    }
  }
  return end
}

export function isObjectFn(node: Node): node is ObjectProperty | ObjectMethod {
  return (node.type === 'ObjectMethod' && node.kind === 'method')
    || (node.type === 'ObjectProperty'
    && (node.value.type === 'FunctionExpression' || node.value.type === 'ArrowFunctionExpression')
    && node.value.body.type === 'BlockStatement'
    )
}

export function getObjectFnBodyLocation(node: ObjectProperty | ObjectMethod): InsertLocation | null {
  if (node.type === 'ObjectMethod') {
    return {
      start: node.body.start ?? 0,
      end: getNodeEndAndFilterReturn(node.body),
    }
  }
  const body = node.value
  if (body.type !== 'ArrowFunctionExpression' && body.type !== 'FunctionExpression')
    return null

  return {
    start: body.body.start ?? 0,
    end: getNodeEndAndFilterReturn(body.body as BlockStatement),
  }
}

export function isCallOf(node: Node, name: string): node is CallExpression {
  return node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === name
}
