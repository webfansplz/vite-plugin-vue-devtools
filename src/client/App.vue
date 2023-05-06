<script setup lang="ts">
import { initPinia } from './logic/pinia'
import { initRoutes } from './logic/routes'
import { initGlobalHook } from './logic/global'

const router = useRouter()
const route = useRoute()
const { scale } = useDevToolsSettings()
const { route: _route, isFirstVisit } = useFrameState()
initGlobalHook()
useColorMode()

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
  setTimeout(() => {
    initRoutes()
    initPinia()
  }, 200)

  watchEffect(() => {
    document.body.style.fontSize = `${scale.value * 15}px`
  })
})

router.replace(_route.value)
</script>

<template>
  <main fixed inset-0 h-screen w-screen>
    <div
      grid="~ cols-[50px_1fr]"
      h-full h-screen of-hidden font-sans bg-base
    >
      <SideNav v-if="route.path !== '/__inspecting'" of-x-hidden of-y-auto />
      <RouterView />
    </div>
  </main>
</template>
