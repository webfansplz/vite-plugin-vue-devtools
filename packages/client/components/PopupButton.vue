<script setup lang="ts">
import { useDevToolsClient } from '~/logic/client'

defineProps<{
  closePopover: () => void
}>()

const client = useDevToolsClient()
const showPopupUnsupported = ref(false)
const copy = useCopy()

const isSupported = typeof window !== 'undefined'
  // @ts-expect-error experimental API
  && window.parent?.documentPictureInPicture?.requestWindow
  && checkIsSecurityContext()

const showNotification = useNotification()

function popup() {
  if (!isSupported) {
    showPopupUnsupported.value = true
    return
  }
  const popupFn = client.value?.panel?.popup as (() => Promise<boolean>) | undefined
  if (popupFn) {
    popupFn().then((success) => {
      if (!success) {
        showNotification({
          text: 'Open popup mode failed, check console for more details.',
          icon: 'i-carbon-warning',
          type: 'error',
          duration: 3000,
          placement: 'bottom',
        })
      }
    })
  }
}
</script>

<template>
  <div flex="~ gap-1">
    <VDButton n="sm primary" @click="popup">
      <i carbon-launch /> Popup <span v-if="!isSupported" op50>(not supported)</span>
    </VDButton>
  </div>

  <!-- popup mode not supported message -->
  <VDDialog
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
      <VDButton n="xs primary" title="Click to Copy" @click="copy('chrome://flags/#document-picture-in-picture-api')">
        chrome://flags/#document-picture-in-picture-api
      </VDButton>
      and restart the browser.
    </p>
    <div>
      <VDButton @click="showPopupUnsupported = false">
        Close
      </VDButton>
    </div>
  </VDDialog>
</template>
