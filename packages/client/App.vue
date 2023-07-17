<script setup lang="ts">
import { useDevToolsClient } from './logic/client'
import { hookApi } from './logic/hook'
import { initRoutes } from './logic/routes'
import { initPinia } from './logic/pinia'

const route = useRoute()
const router = useRouter()
const { scale } = useDevToolsSettings()
const { route: _route, isFirstVisit } = useFrameState()

useColorMode()

hookApi.hook.on('init:vue:app', () => {
  const client = useDevToolsClient()
  const categorizedHookBuffer = client.value.categorizedHookBuffer
  // mark client as loaded
  client.value.markClientLoaded()
  // listen hook
  hookApi.produce()
  // perf timeline
  // close perf timeline to avoid performance issue (#9)
  // initPerfTimeline(categorizedHookBuffer.perf)
  // consume hook buffer
  hookApi.consume(categorizedHookBuffer.component ?? [])
  // init routes
  initRoutes(categorizedHookBuffer.router ?? [])
  // init pinia
  initPinia()
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
    const client = useDevToolsClient()
    client.value?.panel?.toggle()
  }
})

router.replace(_route.value)
</script>

<template>
  <main fixed inset-0 h-screen w-screen>
    <Notification />
    <div grid="~ cols-[50px_1fr]" h-full h-screen of-hidden font-sans bg-base>
      <SideNav v-if="!route.path.startsWith('/__')" of-x-hidden of-y-auto />
      <RouterView />
    </div>
  </main>
</template>
