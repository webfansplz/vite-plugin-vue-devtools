<script setup lang="ts">
import { inspectClientUrl } from '../logic/global'
</script>

<template>
  <div>
    <IframeView :src="inspectClientUrl" />
  </div>
</template>
