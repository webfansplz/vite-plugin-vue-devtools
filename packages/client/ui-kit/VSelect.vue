<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue?: any
    placeholder?: string
    icon?: string
    disabled?: boolean
  }>(),
  {
    modelValue: undefined,
    placeholder: '',
    disabled: false,
    icon: '',
  },
)
const emit = defineEmits<{ (...args: any): void }>()
const input = useVModel(props, 'modelValue', emit, { passive: true })
</script>

<template>
  <div
    class="n-text-input n-border-base n-bg-base focus-within:n-focus-base focus-within:border-context flex flex items-center border rounded px-2 py-1"
  >
    <slot name="icon">
      <VIcon v-if="icon" :icon="icon" class="mr-0.4em text-1.1em op50" />
    </slot>
    <select v-model="input" :disabled="disabled" class="n-bg-base w-full flex-auto !outline-none">
      <option v-if="placeholder" value="" disabled hidden>
        {{ placeholder }}
      </option>
      <slot />
    </select>
  </div>
</template>
