<script setup lang='ts'>
const show = ref(false)
const icon = ref<string | undefined>()
const text = ref<string | undefined>()
const type = ref<'primary' | 'error' | 'warning' | undefined>()
const duration = ref<number>()
let timer: ReturnType<typeof setTimeout> | undefined

provideNotification((opt: {
  text: string
  icon?: string
  type?: 'primary' | 'error' | 'warning'
  duration?: number
}) => {
  text.value = opt.text
  icon.value = opt.icon
  show.value = true
  type.value = opt.type
  duration.value = opt.duration || 1500
  createTimer()
})

const textColor = computed(() => {
  switch (type.value) {
    case 'warning':
      return 'text-orange'
    case 'error':
      return 'text-red'
    default:
      return 'text-primary'
  }
})

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = undefined
  }
}
function createTimer() {
  timer = setTimeout(() => {
    show.value = false
    timer = undefined
  }, duration.value)
}
</script>

<template>
  <div
    fixed left-0 right-0 top-0 z-1000 text-center text-base
    :class="show ? '' : 'pointer-events-none overflow-hidden'"
  >
    <div
      border="~ base"
      flex="~ inline gap2"
      m-3 inline-block items-center rounded px-4 py-1 transition-all duration-300 bg-base
      :style="show ? {} : { transform: 'translateY(-300%)' }"
      :class="[show ? 'shadow' : 'shadow-none', textColor]"
      @mouseenter="clearTimer"
      @mouseleave="createTimer"
    >
      <div v-if="icon" :class="`i-${icon}`" />
      <div>{{ text }}</div>
    </div>
  </div>
</template>
