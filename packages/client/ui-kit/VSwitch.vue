<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean }>(),
  {
    modelValue: false,
    disabled: false,
  },
)
const emit = defineEmits<{ (...args: any): void }>()
const checked = useVModel(props, 'modelValue', emit, { passive: true })
</script>

<template>
  <label
    class="n-disabled:n-disabled n-switch n-switch-base cursor-pointer"
    :checked="checked || null"
    :disabled="disabled || null"
  >
    <input
      v-model="checked"
      type="checkbox"
      class="peer absolute op0"
      :disabled="disabled"
      @keypress.enter="checked = !checked"
    >
    <div class="n-transition n-checked:n-switch-slider-checked n-switch-slider peer-active:n-active-base peer-focus-visible:n-focus-base">
      <div class="n-transition n-checked:n-switch-thumb-checked n-switch-thumb" />
    </div>
    <slot />
  </label>
</template>
