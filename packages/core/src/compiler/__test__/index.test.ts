import MagicString from 'magic-string'
import { analyzeByTraceRerender } from '../trace-rerender'

test('trace-rerender', () => {
  const ms = analyzeByTraceRerender(new MagicString(''), [{ start: 0, end: 0 }])
  expect(ms.toString()).toMatchInlineSnapshot(`
    "
    ;import { getCurrentInstance as __VUE_DEVTOOLS_$getCurrentInstance__, onRenderTracked as __VUE_DEVTOOLS_$onRenderTracked__, onRenderTriggered as __VUE_DEVTOOLS_$onRenderTriggered__ } from 'vue'
    ;

        
    ;__VUE_DEVTOOLS_$onRenderTriggered__((e) => {
          const instance = __VUE_DEVTOOLS_$getCurrentInstance__()
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:triggered', e, instance)
        });

        
    ;__VUE_DEVTOOLS_$onRenderTracked__((e) => {
          const instance = __VUE_DEVTOOLS_$getCurrentInstance__()
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:tracked', e, instance)
        });
    "
  `)
})
