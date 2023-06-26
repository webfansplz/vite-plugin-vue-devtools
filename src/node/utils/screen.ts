import { ref } from 'vue'
import { useWindowEventListener } from './event'

const topVarName = '--vite-plugin-vue-devtools-safe-area-top'
const rightVarName = '--vite-plugin-vue-devtools-devtools-safe-area-right'
const bottomVarName = '--vite-plugin-vue-devtools-safe-area-bottom'
const leftVarName = '--vite-plugin-vue-devtools-safe-area-left'

/**
 * Reactive `env(safe-area-inset-*)`
 *
 * @see https://vueuse.org/useScreenSafeArea
 */
export function useScreenSafeArea() {
  const top = ref(0)
  const right = ref(0)
  const bottom = ref(0)
  const left = ref(0)

  document.documentElement.style.setProperty(topVarName, 'env(safe-area-inset-top, 0px)')
  document.documentElement.style.setProperty(rightVarName, 'env(safe-area-inset-right, 0px)')
  document.documentElement.style.setProperty(bottomVarName, 'env(safe-area-inset-bottom, 0px)')
  document.documentElement.style.setProperty(leftVarName, 'env(safe-area-inset-left, 0px)')

  update()
  useWindowEventListener('resize', update)

  function getValue(position: string) {
    return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(position)) || 0
  }

  function update() {
    top.value = getValue(topVarName)
    right.value = getValue(rightVarName)
    bottom.value = getValue(bottomVarName)
    left.value = getValue(leftVarName)
  }

  return {
    top,
    right,
    bottom,
    left,
    update,
  }
}
