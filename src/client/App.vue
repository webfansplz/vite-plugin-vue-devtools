<script setup lang="ts">
import { initTimeline } from './logic/timeline'
import { initPinia } from './logic/pinia'
import { initRoutes } from './logic/routes'
import { initView } from './logic/global'

useColorMode()

// import { rpc } from './logic/rpc'

// async function get() {
//   const graph = await rpc.componentGraph()
//   console.log(graph)
// }

onMounted(() => {
  initView()
  setTimeout(() => {
    initTimeline()
    initRoutes()
    initPinia()
  }, 200)
})

// get()
const route = useRoute()
const router = useRouter()
router.push('/components')
// router.push('/timeline')
// router.push('/overview')
// router.push('/pages')
// router.push('/pinia')
// router.push('/routes')
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
