<script lang='ts' setup>
import { resetDoc } from '../logic/documentations'

const showDocAdd = ref(false)
const showConfirm = ref(false)
const message = ref('')

function handleShowConfirm() {
  message.value = 'Are you sure you want to reset documents?'
  showConfirm.value = true
}

function confirmResetHandler() {
  resetDoc()
}
</script>

<template>
  <div>
    <VButton mr-10px n="primary" @click="showDocAdd = true">
      Add Documents
    </VButton>
    <VButton n="primary" @click="handleShowConfirm">
      Reset Documents
    </VButton>
  </div>
  <DocAdd v-model="showDocAdd" />
  <VConfirm v-model="showConfirm" :message="message" @confirm="confirmResetHandler" />
</template>
