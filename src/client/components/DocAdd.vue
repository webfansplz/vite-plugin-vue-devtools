<script setup lang="ts">
import { addDoc } from '../logic/documentations';
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

const tabs = [{
  label: "id",
  necessary: true
},
{
  label: "name",
  necessary: true
},
{
  label: "website",
  necessary: true
},
{
  label: "github",
  necessary: false
},
{
  label: "icon",
  necessary: false
},
{
  label: "description",
  necessary: false
}
]
</script>

<template>
  <VDialog v-model="value">
    <div flex="~ col" min-w-100px w-30vw gap-15px p4>
      <div v-for="tab in tabs" flex items-center>
        <label :class="{
          'vue-prefix': tab.necessary
        }" w-95px>{{
  tab.label }}</label>
        <VTextInput op50 :placeholder="tab.necessary ? 'the item is necessary' : 'the item is not necessary'" flex="1">
        </VTextInput>
      </div>
      <div w-full flex items-center justify-end gap-10px>
        <VButton border-none bg="gray-300/30" @click.prevent="$emit('cancel'); hide()">
          cancel
        </VButton>
        <VButton border-none bg-primary text-white hover:text-white @click.prevent="addDoc; hide()">
          add
        </VButton>
      </div>
    </div>
  </VDialog>
</template>
<style scoped>
</style>
