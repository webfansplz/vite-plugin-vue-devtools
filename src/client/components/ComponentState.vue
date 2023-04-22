<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: any
  depth?: number
}>(), {
  depth: 0,
})

function getType(v: any) {
  return Object.prototype.toString.call(v).slice(8, -1)
}

function getStateType(value: any, type: string) {
  if (type === 'Reactive')
    return type

  else if (Array.isArray(value))
    return `Array[${value.length}]`

  else if (getType(value) === 'Object')
    return 'Object'

  else
    return value
}
// literal light #03c dark #997fff
// light 444 dark #bdc6cf
</script>

<template>
  <div
    mb-2 cursor-pointer rounded
  >
    <div hover="dark:bg-[#2c3e50] bg-#c2e9d7" flex items-center rounded py-1 text-sm>
      <i
        class="i-material-symbols:arrow-right"
        h-6 w-6 text-5 text-gray-400 dark:text-gray-600
        :class="{
          'transform rotate-90': false,
        }"
      />
      <!-- <i v-else h-6 w-6 /> -->

      <h3 text="[#7595b5]" font-400>
        {{ data.type }}
      </h3>
    </div>
    <ul pl-10 text-sm text-purple-700 dark:text-purple-300>
      <li
        v-for="(item, index) in data.data"
        :key="index"
      >
        {{ item.key }}:
        <span
          :class="[
            typeof item.value === 'object' ? 'text-#444 dark:text-#bdc6cf' : 'text-#03c dark:text-#997fff',
          ]"
          mr-2
        >
          {{ getStateType(item.value, item.objectType) }}
        </span>
        <span v-if="item.objectType && item.objectType !== 'Reactive'" text-gray-500>({{ item.objectType }})</span>
        <template v-if="typeof item.value === 'object' && item.type === 'setup'">
          <!-- TODO: Extract as component -->
          <p v-if="item.objectType !== 'Reactive'" ml-2>
            <span
              v-for="(tag, tagIndex) in item.value" :key="tagIndex" block
            >
              <span inline-block min-w-3>
                {{ tagIndex }}:
              </span>
              <b
                inline-block indent-2
                text="[#03c]"
                dark:text="[#997fff]"
              >{{ tag }}</b>
            </span>
          </p>
        </template>
      </li>
    </ul>
  </div>
</template>
