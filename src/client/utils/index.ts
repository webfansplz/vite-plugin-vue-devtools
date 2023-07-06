export const objectToString = Object.prototype.toString
export function toTypeString(value: unknown): string {
  return objectToString.call(value)
}

export function toRawType(value: unknown): string {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}

export function isPlainObject(val: unknown): val is object {
  return toTypeString(val) === '[object Object]'
}

export const isArray = Array.isArray
export function isMap(val: unknown): val is Map<any, any> {
  return toTypeString(val) === '[object Map]'
}
export function isSet(val: unknown): val is Set<any> {
  return toTypeString(val) === '[object Set]'
}

export function isDate(val: unknown): val is Date {
  return toTypeString(val) === '[object Date]'
}
export function isRegExp(val: unknown): val is RegExp {
  return toTypeString(val) === '[object RegExp]'
}
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}
export const isString = (val: unknown): val is string => typeof val === 'string'
export const isSymbol = (val: unknown): val is symbol => typeof val === 'symbol'
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}
export function isComputed(raw: any): boolean {
  // @ts-expect-error missing type
  return isRef(raw) && !!raw.effect
}

const ESC = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;',
}

function escapeChar(a: string) {
  return ESC[a as keyof typeof ESC] || a
}

export function escape(s: string) {
  return s.replace(/[<>"&]/g, escapeChar)
}

export function isMacOS() {
  return navigator?.platform
    ? navigator?.platform.toLowerCase().includes('mac')
    : /Macintosh/.test(navigator.userAgent)
}

// https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
export function checkIsSecurityContext() {
  return !!window.isSecureContext
}

// eslint-disable-next-line no-sequences
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): T => keys.reduce((pre: T, cur: K) => (cur in obj && (pre[cur] = obj[cur]), pre), <T>({}))
