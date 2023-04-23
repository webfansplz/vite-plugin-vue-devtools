function getFuntionDetails(func: Function) {
  let string = ''
  let matches = null
  try {
    string = Function.prototype.toString.call(func)
    matches = String.prototype.match.call(string, /\([\s\S]*?\)/)
  }
  catch (e) {
    // Func is probably a Proxy, which can break Function.prototype.toString()
  }
  // Trim any excess whitespace from the argument string
  const match = matches && matches[0]
  const args = typeof match === 'string'
    ? match
    : '(?)'
  const name = typeof func.name === 'string' ? func.name : ''
  return `function ${escape(name)}${args}`
}

// TODO: data type handler, related to vuejs/devtools/packages/shared-utils/src/util.ts
export function normalizeState(value: unknown): any {
  if (isRef(value)) {
    return normalizeState(value.value)
  }

  else if (isArray(value)) {
    return {
      type: 'array',
      display: `Array[${value.length}]`,
      value: value.map((item, index) => ({ [index]: item })),
    }
  }
  else if (typeof value === 'function') {
    return {
      type: 'function',
      display: '',
      value: getFuntionDetails(value),
    }
  }
  else if (typeof value === 'bigint') {
    const stringifiedBigInt = BigInt.prototype.toString.call(value)
    return {
      type: 'bigint',
      display: `BigInt(${stringifiedBigInt})`,
      value: stringifiedBigInt,
    }
  }
  else if (value !== 'null' && typeof value === 'object') {
    if (isMap(value)) {
      return {
        type: 'map',
        display: 'Map',
        value: Array.from(value.entries()).map(([key, value]) => ({ [key]: value })),
      }
    }
    else if (isSet(value)) {
      const list = Array.from(value)
      return {
        type: 'set',
        display: `Set[${list.length}]`,
        value: list,
        readonly: true,
      }
    }
    else if (isRegExp(value)) {
      return {
        type: 'regexp',
        display: 'RegExp',
        value: RegExp.prototype.toString.call(value),
      }
    }
    else if (isDate(value)) {
      return {
        type: 'date',
        display: 'Date',
        value: Date.prototype.toISOString.call(value),
      }
    }
    else if (toRawType(value) === 'Error') {
      return {
        type: 'error',
        display: 'Error',
        // @ts-expect-error skip
        value: `${value?.message}: ${value?.stack}`,
      }
    }
    // @ts-expect-error skip
    else if ((value?.state && value._vm) || (value.constructor?.name === 'Store' && value._wrappedGetters)) {
      // TODO: Custom Store
      return {
        type: 'store',
        display: 'Store',
        value: 'Custom Store',
      }
    }
    // @ts-expect-error skip
    else if ((value.constructor && value.constructor.name === 'VueRouter') || value.currentRoute) {
      // TODO: Vue Router
      return {
        type: 'vue-router',
        display: 'VueRouter',
        value: 'Vue Router',
      }
    }
    else if (false) {
      // TODO: Vue Instance
    }
    // @ts-expect-error skip
    else if (value.constructor && value.constructor.name === 'VNode') {
      // TODO: Vue Router
      return {
        type: 'vnode',
        display: 'VNode',
        value: 'VNode',
      }
    }
    else if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
      // TODO: HTMLElement
      return {
        type: 'element',
        display: 'Element',
        value: 'Element',
      }
    }
    else {
      return {
        type: 'object',
        display: 'Object',
        value: Object.entries(value!).map(([key, value]) => ({ [key]: value })),
      }
    }
  }
  else if (Number.isNaN(value)) {
    return {
      type: 'NaN',
      display: 'NaN',
      value: 'NaN',
    }
  }
  else if (value === Infinity) {
    return {
      type: 'Infinity',
      display: 'Infinity',
      value: 'Infinity',
    }
  }
  else if (value === -Infinity) {
    return {
      type: '-Infinity',
      display: '-Infinity',
      value: '-Infinity',
    }
  }
  else if (typeof value === 'symbol') {
    return {
      type: 'symbol',
      display: 'Symbol',
      value: Symbol.prototype.toString.call(value),
    }
  }
  else if (typeof value === 'undefined') {
    return {
      type: 'undefined',
      display: 'undefined',
      value: 'undefined',
    }
  }
  else {
    return {
      type: 'basic',
      display: '',
      value,
    }
  }
}
