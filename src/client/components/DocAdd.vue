<script setup lang="ts">
import { addDoc } from '../logic/documentations'
import type { DocumentInfo } from '../../types'

const props = defineProps<{
  modelValue?: boolean
}>()

const emits = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'cancel'): void
  (event: 'add'): void
}>()

const value = useVModel(props, 'modelValue', emits, { passive: true })

function hide() {
  value.value = false
}

const form = reactive([{
  label: 'id',
  necessary: true,
  value: '',
},
{
  label: 'name',
  necessary: true,
  value: '',
},
{
  label: 'website',
  necessary: true,
  value: '',
},
{
  label: 'github',
  necessary: false,
  value: '',
},
{
  label: 'icon',
  necessary: false,
  value: '',
},
{
  label: 'description',
  necessary: false,
  value: '',
}])

function handleAddDoc() {
  const docInfo = Object.fromEntries(form.map(item => [item.label, item.value])) as any as DocumentInfo
  addDoc(docInfo)
  hide()
}
</script>

<template>
  <VDialog v-model="value">
    <div flex="~ col" min-w-100px w-30vw gap-15px p4>
      <div v-for="item in form" :key="item.label" flex items-center>
        <label
          :class="{
            'vue-doc-required': item.necessary,
          }" w-95px
        >{{ item.label }}</label>
        <VTextInput v-model="item.value" op50 :placeholder="item.necessary ? 'necessary' : 'not necessary'" flex="1" />
      </div>
      <div w-full flex items-center justify-end gap-10px>
        <VButton border-none bg="gray-300/30" @click.prevent="$emit('cancel'); hide()">
          cancel
        </VButton>
        <VButton border-none bg-primary text-white hover:text-white @click.prevent="handleAddDoc">
          add
        </VButton>
      </div>
    </div>
  </VDialog>
</template>

<style scoped>
</style>
