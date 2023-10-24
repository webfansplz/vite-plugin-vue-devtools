<script setup lang='ts'>
const show = ref(false)
const icon = ref<string | undefined>()
const text = ref<string | undefined>()
const type = ref<'primary' | 'error' | 'warning' | undefined>()
const duration = ref<number>()
const placement = ref<'top' | 'bottom'>('top')
let timer: ReturnType<typeof setTimeout> | undefined

provideNotification((opt: {
  text: string
  icon?: string
  type?: 'primary' | 'error' | 'warning'
  duration?: number
  placement?: 'top' | 'bottom'
}) => {
  text.value = opt.text
  icon.value = opt.icon
  show.value = true
  type.value = opt.type
  duration.value = opt.duration || 1500
  placement.value = opt.placement || 'top'
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
    fixed z-1000 text-center text-base
    :class="[
      {
        'pointer-events-none overflow-hidden': !show,
      },
      [
        placement === 'top' ? 'top-0' : 'bottom-0',
      ],
    ]"
  >
    <div
      border="~ base"
      flex="~ inline gap2"
      m-3 inline-block items-center rounded px-4 py-1 transition-transform duration-300 bg-base
      :class="[
        show
          ? 'shadow'
          : `shadow-none  ${placement === 'top' ? 'translate-y--300%' : 'translate-y-300%'}`,
        textColor,
      ]"
      @mouseenter="clearTimer"
      @mouseleave="createTimer"
    >
      <div v-if="icon" :class="`i-${icon}`" />
      <div>{{ text }}</div>
    </div>
  </div>
</template>
