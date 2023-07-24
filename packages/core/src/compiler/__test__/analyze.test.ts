import type { AnalyzeOptions } from '..'
import { analyzeCode } from '..'

const baseConfig: AnalyzeOptions = {
  rerenderTrace: true,
}

describe('analyzeCode - exclude', () => {
  test('not acceptable lang', () => {
    expect(analyzeCode('', 'test.txt', baseConfig)).toBeNull()
  })
  test('excluded path', () => {
    expect(analyzeCode('', 'node_modules/test.js', baseConfig)).toBeNull()
  })
  test('not enabled', () => {
    expect(analyzeCode('', 'test.js', { rerenderTrace: false })).toBeNull()
  })
  test('should execute', () => {
    expect(analyzeCode(`
      import { ref, h } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref(1)
          return () => h('div', '1')
        }
      })
    `, 'test.js', baseConfig)).not.toBeNull()
  })
})

describe('analyzeCode - rerender - sfc', () => {
  test('script setup', () => {
    const code = `
      <script setup lang="ts">
        import { ref } from 'vue'
        const a = ref<number>(1)
      </script>
      <template>
        <div></div>
      </template>
    `
    const result = analyzeCode(code, 'test.vue', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('script setup with script', () => {
    const code = `
      <script lang="ts">
        export default {
          name: "Test"
        }
      </script>
      <script setup lang="ts">
        import { ref } from 'vue'
        const a = ref<number>(1)
      </script>
      <template>
        <div></div>
      </template>
    `
    const result = analyzeCode(code, 'test.vue', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('only script', () => {
    const code = `
      <script lang="ts">
        import { ref } from 'vue'

        export default {
          name: "Test",
          setup() {
            const ref = ref<number>(1)
            return {
              ref
            }
          }
        }
      </script>
      <template>
        <div></div>
      </template>
    `
    const result = analyzeCode(code, 'test.vue', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
})

describe('analyzeCode - rerender - [jt]sx?', () => {
  test('jsx', () => {
    const code = `
      import { ref } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref<number>(1)
          return () => <div></div>
        }
      })
    `
    const result = analyzeCode(code, 'test.jsx', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('tsx', () => {
    const code = `
      import { ref } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref<number>(1)
          return () => <div></div>
        }
      })
    `
    const result = analyzeCode(code, 'test.tsx', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('js', () => {
    const code = `
      import { ref, h } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref(1)
          return () => h('div', '1')
        }
      })
    `
    const result = analyzeCode(code, 'test.js', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('ts', () => {
    const code = `
      import { ref, h } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref<number>(1)
          return () => h('div', '1')
        }
      })
    `
    const result = analyzeCode(code, 'test.ts', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
  test('multiple component in one file', () => {
    const code = `
      import { ref, h } from 'vue'
      const comp = defineComponent({
        setup() {
          const a = ref<number>(1)
          return () => h('div', '1')
        }
      })
      const comp2 = defineComponent({
        setup() {
          const a = ref<number>(1)
          return () => h('div', '1')
        }
      })
    `
    const result = analyzeCode(code, 'test.ts', baseConfig)
    expect(result?.code).toMatchSnapshot()
  })
})
