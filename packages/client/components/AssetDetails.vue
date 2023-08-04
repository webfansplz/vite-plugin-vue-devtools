<script setup lang="ts">
import { useDevToolsClient } from '~/logic/client'
import { rpc } from '~/logic/rpc'

const props = defineProps<{
  modelValue: AssetInfo
}>()
const emit = defineEmits<{ (...args: any): void }>()
const asset = useVModel(props, 'modelValue', emit, { passive: true })
const showNotification = useNotification()
const origin = window.parent.location.origin

const imageMeta = computedAsync(() => {
  if (asset.value.type !== 'image')
    return undefined
  return rpc.getImageMeta(asset.value.filePath)
})

const textContent = computedAsync(() => {
  if (asset.value.type !== 'text')
    return undefined
  return rpc.getTextAssetContent(asset.value.filePath)
})

const copy = useCopy()
const timeAgo = useTimeAgo(() => asset.value.mtime)
const fileSize = computed(() => {
  const size = asset.value.size
  if (size < 1024)
    return `${size} B`
  if (size < 1024 * 1024)
    return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
})

const aspectRatio = computed(() => {
  if (!imageMeta.value?.width || !imageMeta.value?.height)
    return ''
  const gcd = (a: number, b: number): number => {
    if (!b)
      return a
    return gcd(b, a % b)
  }
  const ratio = gcd(imageMeta.value.width, imageMeta.value.height)
  if (ratio > 3)
    return `${imageMeta.value.width / ratio}:${imageMeta.value.height / ratio}`
  return ''
})

const supportsPreview = computed(() => {
  return [
    'image',
    'text',
    'video',
    'font',
  ].includes(asset.value.type)
})

const deleteDialog = ref(false)
async function deleteAsset() {
  try {
    await rpc.deleteStaticAsset(asset.value.filePath)
    asset.value = undefined as any
    deleteDialog.value = false
    showNotification({
      text: 'Asset deleted',
      icon: 'carbon-checkmark',
      type: 'primary',
    })
  }
  catch (error) {
    deleteDialog.value = false
    showNotification({
      text: 'Something went wrong!',
      icon: 'carbon-warning',
      type: 'error',
    })
  }
}

const renameDialog = ref(false)
const newName = ref('')
async function renameAsset() {
  const parts = asset.value.filePath.split('/')
  const oldName = parts.slice(-1)[0].split('.').slice(0, -1).join('.')
  if (!newName.value || newName.value === oldName) {
    return showNotification({
      text: 'Please enter a new name',
      icon: 'carbon-warning',
      type: 'error',
    })
  }
  try {
    const extension = parts.slice(-1)[0].split('.').slice(-1)[0]
    const fullPath = `${parts.slice(0, -1).join('/')}/${newName.value}.${extension}`
    await rpc.renameStaticAsset(asset.value.filePath, fullPath)

    asset.value = undefined as any
    renameDialog.value = false
    showNotification({
      text: 'Asset renamed',
      icon: 'carbon-checkmark',
      type: 'primary',
    })
  }
  catch (error) {
    showNotification({
      text: 'Something went wrong!',
      icon: 'carbon-warning',
      type: 'error',
    })
  }
}

const client = useDevToolsClient()
</script>

<template>
  <div flex="~ col gap-4" min-h-full w-full of-hidden p4>
    <template v-if="supportsPreview">
      <div flex="~ gap2" mb--2 items-center op50>
        <div x-divider />
        <div flex-none>
          Preview
        </div>
        <div x-divider />
      </div>

      <div flex="~" items-center justify-center>
        <AssetPreview
          border="~ base"
          detail max-h-80 min-h-20 min-w-20 w-auto rounded
          :asset="asset"
          :text-content="textContent"
        />
      </div>
    </template>

    <div flex="~ gap2" mb--2 items-center op50>
      <div x-divider />
      <div flex-none>
        Details
      </div>
      <div x-divider />
    </div>

    <table max-w-full w-full table-fixed>
      <tbody>
        <tr>
          <td w-30 ws-nowrap pr5 text-right op50>
            Filepath
          </td>
          <td>
            <div flex="~ gap-1" w-full items-center>
              <FilepathItem :filepath="asset.filePath" text-left />
              <VDIconButton
                flex-none
                title="Open in Editor"
                icon="carbon-launch"
                @click="client.openInEditor(asset.filePath)"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td w-30 ws-nowrap pr5 text-right op50>
            Public Path
          </td>
          <td>
            <div flex="~ gap-1" w-full items-center of-hidden>
              <div flex-auto of-hidden truncate ws-pre font-mono>
                {{ asset.publicPath }}
              </div>
              <VDIconButton
                flex-none
                title="Copy public path"
                icon="carbon-copy"
                @click="copy(asset.publicPath)"
              />
              <VDIconButton
                flex-none
                :to="`${origin}${asset.publicPath}`"
                icon="carbon-launch"
                target="_blank"
                title="Open in browser"
              />
            </div>
          </td>
        </tr>
        <tr>
          <td w-30 ws-nowrap pr5 text-right op50>
            Type
          </td>
          <td capitalize>
            {{ asset.type }}
          </td>
        </tr>
        <template v-if="imageMeta?.width">
          <tr>
            <td w-30 ws-nowrap pr5 text-right op50>
              Image Size
            </td>
            <td>{{ imageMeta.width }} x {{ imageMeta.height }}</td>
          </tr>
          <tr v-if="aspectRatio">
            <td w-30 ws-nowrap pr5 text-right op50>
              Aspect Ratio
            </td>
            <td>{{ aspectRatio }}</td>
          </tr>
        </template>
        <tr>
          <td w-30 ws-nowrap pr5 text-right op50>
            File size
          </td>
          <td>{{ fileSize }}</td>
        </tr>
        <tr>
          <td w-30 ws-nowrap pr5 text-right op50>
            Last modified
          </td>
          <td>{{ new Date(asset.mtime).toLocaleString() }} <span op70>({{ timeAgo }})</span></td>
        </tr>
      </tbody>
    </table>

    <div flex="~ gap2" mb--2 items-center op50>
      <div x-divider />
      <div flex-none>
        Actions
      </div>
      <div x-divider />
    </div>
    <div flex="~ gap2 wrap">
      <VDButton :to="`${origin}${asset.publicPath}`" download target="_blank" icon="carbon-download" n="green">
        Download
      </VDButton>
      <VDButton icon="carbon-text-annotation-toggle" n="blue" @click="renameDialog = !renameDialog">
        Rename
      </VDButton>
      <VDButton icon="carbon-delete" n="red" @click="deleteDialog = !deleteDialog">
        Delete
      </VDButton>
    </div>

    <div flex-auto />

    <VDDialog v-model="deleteDialog">
      <div flex="~ col gap-4" min-h-full w-full of-hidden p8>
        <span>
          Are you sure you want to delete this asset?
        </span>
        <div flex="~ gap2 wrap justify-center">
          <VDButton icon="carbon-close" @click="deleteDialog = false">
            Cancel
          </VDButton>
          <VDButton icon="carbon-delete" n="red" @click="deleteAsset">
            Delete
          </VDButton>
        </div>
      </div>
    </VDDialog>
    <VDDialog v-model="renameDialog">
      <div flex="~ col gap-4" min-h-full w-full of-hidden p8>
        <VDTextInput v-model="newName" placeholder="New name" n="blue" />
        <div flex="~ gap2 wrap justify-center">
          <VDButton icon="carbon-close" @click="renameDialog = false">
            Cancel
          </VDButton>
          <VDButton icon="carbon-text-annotation-toggle" n="blue" @click="renameAsset">
            Rename
          </VDButton>
        </div>
      </div>
    </VDDialog>
  </div>
</template>
