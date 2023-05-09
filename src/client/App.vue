<script setup lang="ts">
import { useDevtoolsClient } from './logic/client'
import { hookApi } from './logic/hook'
import { initRoutes } from './logic/routes'
import { initPinia } from './logic/pinia'
import { initPerfTimeline } from './logic/timeline'

const route = useRoute()
const router = useRouter()
const { scale } = useDevToolsSettings()
const { route: _route, isFirstVisit } = useFrameState()

useColorMode()

hookApi.hook.on('init:vue:app', () => {
  const client = useDevtoolsClient()
  const frameState = useFrameState()
  const hookBuffer = client.value.hookBuffer
  // mark client as loaded
  client.value.markClientLoaded()
  // listen hook
  hookApi.produce()
  // perf timeline
  initPerfTimeline(hookBuffer.filter(([type]) => type.startsWith('perf:')))
  // consume hook buffer
  hookApi.consume(hookBuffer.filter(([type]) => type.startsWith('component:')))
  // init routes
  initRoutes()
  // init pinia
  initPinia()
  hookApi.hook.on('host:inspector:close', () => {
    if (route.path === '/__inspecting')
      router.replace(frameState.route.value)
  })
})

router.beforeEach((to, _, next) => {
  if (to.path === '/' && !isFirstVisit.value) {
    next('/overview')
    return
  }
  next()
})

router.afterEach(() => {
  const path = route.path
  if (path.includes('__'))
    return
  _route.value = path
})

onMounted(() => {
  watchEffect(() => {
    document.body.style.fontSize = `${scale.value * 15}px`
  })
})

useEventListener('keydown', (e) => {
  if (e.code === 'KeyD' && e.altKey && e.shiftKey) {
    const client = useDevtoolsClient()
    client.value?.panel?.toggle()
  }
})

router.replace(_route.value)
</script>

<template>
  <main fixed inset-0 h-screen w-screen>
    <div grid="~ cols-[50px_1fr]" h-full h-screen of-hidden font-sans bg-base>
      <SideNav v-if="route.path !== '/__inspecting'" of-x-hidden of-y-auto />
      <RouterView />
    </div>
  </main>
</template>
