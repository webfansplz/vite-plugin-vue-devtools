<script setup lang="ts">
import { inspectClientUrl } from '../logic/rpc'
</script>

<template>
  <div>
    <IframeView :src="inspectClientUrl" />
  </div>
</template>
