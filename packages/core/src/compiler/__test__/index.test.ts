import MagicString from 'magic-string'
import { analyzeByTraceRerender } from '../trace-rerender'

test('trace-rerender', () => {
  const ms = analyzeByTraceRerender(new MagicString(''), { start: 0, end: 0 })
  expect(ms.toString()).toMatchInlineSnapshot(`
    "
    ;import { getCurrentInstance as __VUE_DEVTOOLS_$getCurrentInstance__, onRenderTracked as __VUE_DEVTOOLS_$onRenderTracked__, onRenderTriggered as __VUE_DEVTOOLS_$onRenderTriggered__ } from 'vue'
    ;

        ;const __VUE_DEVTOOLS_$colors__ = [
        ['#ff000033', 100],
        ['#7f000033', 50],
        ['#ffff0033', 20],
        ['#7f7f0033', 10],
        ['#00800033', 5],
        ['#00400033', 0],
      ]

      function __VUE_DEVTOOLS_$debounce__(fn, delay) {
        let timer = null
        return function () {
          if (timer)
            clearTimeout(timer)

          timer = setTimeout(() => {
            fn.apply(this, arguments)
            timer = null
          }, delay)
        }
      };

      let __VUE_DEVTOOLS_$highlightEl__ = null
      let __VUE_DEVTOOLS_$times__ = 0
      const __VUE_DEVTOOLS_$debounceFn__ = __VUE_DEVTOOLS_$debounce__(() => {
        document.body.removeChild(__VUE_DEVTOOLS_$highlightEl__)
        __VUE_DEVTOOLS_$highlightEl__ = null
        __VUE_DEVTOOLS_$times__ = 0
      }, 3000)
      
        
    ;__VUE_DEVTOOLS_$onRenderTriggered__((e) => {
          const instance = __VUE_DEVTOOLS_$getCurrentInstance__()
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:triggered', e, instance, (el) => {
        if (__VUE_DEVTOOLS_$highlightEl__) {
          __VUE_DEVTOOLS_$highlightEl__.style.backgroundColor = __VUE_DEVTOOLS_$colors__.find(([color, time]) => __VUE_DEVTOOLS_$times__ >= time)[0]
          __VUE_DEVTOOLS_$times__ += 1
        }
        else {
          el.style.backgroundColor = __VUE_DEVTOOLS_$colors__.at(-1)[0]
          __VUE_DEVTOOLS_$highlightEl__ = el
          document.body.appendChild(el)
        }
        __VUE_DEVTOOLS_$debounceFn__()
      })
        });

        
    ;__VUE_DEVTOOLS_$onRenderTracked__((e) => {
          const instance = __VUE_DEVTOOLS_$getCurrentInstance__()
          window.__VUE_DEVTOOLS_GLOBAL_HOOK__?.emit?.('render:tracked', e, instance)
        });
    "
  `)
})
