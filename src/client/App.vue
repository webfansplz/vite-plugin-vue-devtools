<script setup lang="ts">
import { rpc } from './logic/rpc'

async function get() {
  const graph = await rpc.componentGraph()
  console.log(graph)
}

get()
const route = useRoute()
const router = useRouter()
// router.push('/components')
// router.push('/timeline')
// router.push('/overview')
router.push('/pages')
</script>

<template>
  <main fixed inset-0 h-screen w-screen>
    <div
      grid="~ cols-[50px_1fr]"
      h-full h-screen of-hidden font-sans bg-base
    >
      <SideNav of-x-hidden of-y-auto />
      <RouterView />
    </div>
  </main>
</template>
