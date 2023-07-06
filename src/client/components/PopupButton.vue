<script setup lang="ts">
import { useDevtoolsClient } from '../logic/client'

const client = useDevtoolsClient()
// @ts-expect-error missing type
const isSupported = typeof window !== 'undefined' && window.parent.documentPictureInPicture?.requestWindow
const showPopupUnsupported = ref(false)
const copy = useCopy()

function popup() {
  if (!isSupported) {
    showPopupUnsupported.value = true
    return
  }

  client.value?.panel?.popup()
}
</script>

<template>
  <div flex="~ gap-1">
    <VButton n="sm primary" @click="popup">
      <i carbon-launch /> Popup <span v-if="!isSupported" op50>(not supported)</span>
    </VButton>
  </div>

  <!-- popup mode not supported message -->
  <VDialog
    v-model="showPopupUnsupported" class="popup-dialog z-2000 max-w-150 p6 pt-2"
    @close="showPopupUnsupported = false"
  >
    <h1 text-3xl>
      Popup is not Supported
    </h1>
    <p>
      To popup the DevTools, it requires the <a
        href="https://developer.chrome.com/docs/web-platform/document-picture-in-picture/" target="_blank" font-bold
        underline
      >Document
        Picture-in-Picture API</a> which is currently in experimental state.
    </p>
    <p>
      As June 2023, the API is only available in Chrome 111 and above, under a flag
      <code>#document-picture-in-picture-api</code>.
    </p>
    <p>
      Your current browser does not seem to support the API, or the flag is not enabled yet.
      You can try enabling the flag by visiting
      <VButton n="xs primary" title="Click to Copy" @click="copy('chrome://flags/#document-picture-in-picture-api')">
        chrome://flags/#document-picture-in-picture-api
      </VButton>
      and restart the browser.
    </p>
    <div>
      <VButton @click="showPopupUnsupported = false">
        Close
      </VButton>
    </div>
  </VDialog>
</template>
