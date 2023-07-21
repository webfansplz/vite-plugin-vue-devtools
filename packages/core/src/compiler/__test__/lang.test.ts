import { isAcceptableLang, isJSX, isTS, isVUE } from '../common'

describe('compiler:lang', () => {
  test.each([
    ['ts', true],
    ['tsx', true],
    ['js', false],
    ['jsx', false],
    ['vue', false],
  ])('isTS(%s) === %s', (lang, expected) => {
    expect(isTS(lang)).toBe(expected)
  })
  test.each([
    ['ts', false],
    ['tsx', true],
    ['js', false],
    ['jsx', true],
    ['vue', false],
  ])('isJSX(%s) === %s', (lang, expected) => {
    expect(isJSX(lang)).toBe(expected)
  })
  test.each([
    ['a.vue', true],
    ['vue', true],
    ['avue', false],
    ['a.vue.js', false],
  ])('isVUE(%s) === %s', (filename, expected) => {
    expect(isVUE(filename)).toBe(expected)
  })
  test.each([
    ['.vue', true],
    ['.jsx', true],
    ['.tsx', true],
    ['.js', true],
    ['.ts', true],
    ['.rs', false],
    ['.go', false],
  ])('isAcceptableLang(%s) === %s', (filename, expected) => {
    expect(isAcceptableLang(filename)).toBe(expected)
  })
})
