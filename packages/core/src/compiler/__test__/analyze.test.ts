import type { AnalyzeOptions } from '..'
import { analyzeCode } from '..'

const baseConfig: AnalyzeOptions = {
  rerender: true,
  exclude: [],
}

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
