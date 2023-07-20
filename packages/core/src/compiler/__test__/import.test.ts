import MagicString from 'magic-string'
import { IMPORT_ALIAS, PURE_IMPORT_RE, collectAllImports, supplementImport } from '../common'

describe('compiler:imports', () => {
  test('collect imports', () => {
    const code = `
      import { ref } from 'vue'
      import {useRouter,type Router} from 'vue-router'
      const a = 1
      import * from 'vue-i18n'
      import * as pinia from 'pinia'
      import 'index.css'
      import { reactive as vReactive, onMounted } from 'vue'
      import {
        shallowRef as sref,
        shallowReactive,
      } from 'vue'
    `
    expect(collectAllImports(code)).toMatchInlineSnapshot(`
      {
        "index.css": {
          "all": true,
          "allAlias": null,
        },
        "pinia": {
          "all": true,
          "allAlias": "*",
        },
        "vue": [
          {
            "alias": null,
            "raw": "ref",
          },
          {
            "alias": "vReactive",
            "raw": "reactive",
          },
          {
            "alias": null,
            "raw": "onMounted",
          },
          {
            "alias": "sref",
            "raw": "shallowRef",
          },
          {
            "alias": null,
            "raw": "shallowReactive",
          },
        ],
        "vue-i18n": {
          "all": true,
          "allAlias": null,
        },
        "vue-router": [
          {
            "alias": null,
            "raw": "useRouter",
          },
        ],
      }
    `)
  })
  test.each([
    ['{ref', 'ref'],
    ['ref', 'ref'],
    ['ref}', 'ref'],
    ['{ ref', 'ref'],
    ['{type ref', 'type ref'],
    ['a as b', 'a as b'],
    [`{
      ref }`, 'ref'],
    [`{
      ref`, 'ref'],
    [`{
      ref,
    }`, 'ref'],
  ])('pure import re <%s> <%s>', (input, expected) => {
    expect(PURE_IMPORT_RE.exec(input)?.[1]).toEqual(expected)
  })
})

describe('compiler:import:alias', () => {
  test.each([
    ['* as b', ['*', 'b']],
    ['* as $Foo_aFOo', ['*', '$Foo_aFOo']],
    ['a as b', ['a', 'b']],
    ['a as $Foo_aFOo', ['a', '$Foo_aFOo']],
  ])('IMPORT_ALL_ALIAS <%s> <%s>', (input, expected) => {
    const r = IMPORT_ALIAS.exec(input)!
    expect([r[1], r[2]]).toEqual(expected)
  })
})

test('compiler:import:supplementImport', () => {
  const fixtures = {
    vue: [
      {
        alias: null,
        raw: 'ref',
      },
    ],
  }
  const ms = supplementImport(new MagicString(''), fixtures, {
    vue: [{
      id: 'reactive',
      alias: '$$reactive',
    }, {
      id: 'onMounted',
      alias: '$$onMounted',
    }],
  })
  expect(ms.toString()).toMatchInlineSnapshot(`
    "import { reactive as $$reactive, onMounted as $$onMounted } from 'vue';
    "
  `)
})
