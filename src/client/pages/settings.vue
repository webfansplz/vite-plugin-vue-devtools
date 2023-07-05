<script setup lang="ts">
import { getSortedTabs } from '../store'

const {
  scale,
  hiddenTabs,
  hiddenTabGroups,
} = useDevToolsSettings()

const { closeOnOutsideClick } = useFrameState()

const scaleOptions = [
  ['Tiny', 12 / 15],
  ['Small', 14 / 15],
  ['Normal', 1],
  ['Large', 16 / 15],
  ['Huge', 18 / 15],
]

const groupedTabs = useGroupedTabs(false)

function toggleTab(name: string, v: boolean) {
  if (v)
    hiddenTabs.value = hiddenTabs.value.filter(i => i !== name)
  else
    hiddenTabs.value.push(name)
}

function toggleTabCategory(name: string, v: boolean) {
  if (v)
    hiddenTabGroups.value = hiddenTabGroups.value.filter(i => i !== name)
  else
    hiddenTabGroups.value.push(name)
}

function toggleClickOutside() {
  closeOnOutsideClick.value = !closeOnOutsideClick.value
}

const showTabGroup = ref(false)
</script>

<template>
  <div overflow-scroll px6 py6>
    <VIconTitle class="mb-5 text-xl op75" icon="i-carbon-settings" text="DevTools Settings" />
    <div grid="~ md:cols-2 gap-x-10 gap-y-3" max-w-300>
      <div flex="~ col gap-1" py3>
        <div flex items-center justify-between>
          <h3 mb1 text-lg>
            Tabs
          </h3>
          <VTooltip placement="top">
            <button aria-label="Nav group" @click="showTabGroup = !showTabGroup">
              <div
                material-symbols-tab-group-outline transition-colors hover:text-primary
                :class="{ 'text-primary': showTabGroup }"
              />
            </button>
            <template #popper>
              <div>Nav group</div>
            </template>
          </VTooltip>
        </div>
        <div v-if="!showTabGroup">
          <template v-for="[name, { tabs }] of groupedTabs" :key="name">
            <div
              v-if="tabs.length" flex="~ col gap-1" mx--1
              :class="hiddenTabGroups.includes(name) ? 'op50 grayscale' : ''" pt-2
            >
              <VSwitch
                flex="~ row-reverse" px2 py1 n-lime :model-value="!hiddenTabGroups.includes(name)"
                @update:model-value="v => toggleTabCategory(name, v)"
              >
                <div flex="~ gap-2" flex-auto items-center justify-start>
                  <span capitalize op75>{{ name }}</span>
                </div>
              </VSwitch>
              <div flex="~ col gap-1" border="~ base rounded" py3 pl4 pr2>
                <template v-for="tab of getSortedTabs(tabs)" :key="tab.name">
                  <VSwitch
                    flex="~ row-reverse" py1 n-primary :model-value="!hiddenTabs.includes(tab.title)"
                    @update:model-value="v => toggleTab(tab.title, v)"
                  >
                    <div
                      flex="~ gap-2" flex-auto items-center justify-start
                      :class="hiddenTabs.includes(tab.title) ? 'op25' : ''"
                    >
                      <TabIcon text-xl :icon="tab.icon" :title="tab.title" />
                      <span>{{ tab.title }}</span>
                    </div>
                  </VSwitch>
                </template>
              </div>
            </div>
          </template>
        </div>
        <TabGroup v-else />
      </div>
      <div>
        <div py3 flex="~ col gap-1" border="b base">
          <h3 mb1 text-lg>
            Appearance
          </h3>
          <div>
            <VDarkToggle v-slot="{ toggle, isDark }">
              <VButton n="primary" @click="toggle">
                <div carbon-sun dark:carbon-moon translate-y--1px /> {{ isDark.value ? 'Dark' : 'Light' }}
              </VButton>
            </VDarkToggle>
          </div>
        </div>
        <div py3 flex="~ col gap-1">
          <h3 mb1 text-lg>
            UI Scale
          </h3>
          <VSelect v-model="scale" n="primary">
            <option v-for="i of scaleOptions" :key="i[0]" :value="i[1]">
              {{ i[0] }}
            </option>
          </VSelect>
        </div>
        <div py3 flex="~ justify-between gap-1">
          <h3 mb1 text-lg>
            Close DevTools when clicking outside
          </h3>
          <VSwitch
            flex="~ row-reverse" py1 n-primary :model-value="closeOnOutsideClick"
            @update:model-value="toggleClickOutside"
          />
        </div>
      </div>
    </div>
  </div>
</template>
