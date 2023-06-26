import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import { useWindowEventListener } from '.'

export function useObjectStorage<T>(key: string, initial: T, readonly = false): Ref<T> {
  const raw = localStorage.getItem(key)
  const data = ref(raw ? JSON.parse(raw) : initial)

  for (const key in initial) {
    if (data.value[key] === undefined)
      data.value[key] = initial[key]
  }

  let updating = false
  let wrote = ''

  if (!readonly) {
    watch(data, (value) => {
      if (updating)
        return
      wrote = JSON.stringify(value)
      localStorage.setItem(key, wrote)
    }, { deep: true, flush: 'post' })
  }

  useWindowEventListener('storage', (e: StorageEvent) => {
    if (e.key === key && e.newValue && e.newValue !== wrote) {
      updating = true
      data.value = JSON.parse(e.newValue)
      updating = false
    }
  })

  return data
}
