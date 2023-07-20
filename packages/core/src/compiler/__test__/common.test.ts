import { getBabelParsePlugins, parseSFC } from '../common'

describe('compiler:common', () => {
  test.each([
    ['ts', ['typescript']],
    ['tsx', ['typescript', 'jsx']],
    ['js', []],
    ['jsx', ['jsx']],
  ])('getBabelParsePlugins(%s) === %s', (lang, expected) => {
    expect(getBabelParsePlugins(lang)).toEqual(expected)
  })
})

describe('compiler:common:parseSFC', () => {
  test('should parse <script> and <script setup> with the same language', () => {
    const code = `
      <script lang="ts">
      </script>
      <script setup lang="ts">
      </script>
      <template>
      </template>
    `
    expect(() => {
      parseSFC(code, 'test.vue')
    }).not.toThrow()
  })
})
