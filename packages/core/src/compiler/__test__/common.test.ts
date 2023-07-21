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
  test('should throw if <script> and <script setup> use different languages', () => {
    const code = `
      <script lang="ts">
        const a = 1
      </script>
      <script setup>
        const a = 1
      </script>
      <template>
      </template>
    `
    expect(() => {
      parseSFC(code, 'test.vue')
    }).toThrow()
  })
})
