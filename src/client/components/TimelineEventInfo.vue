<script setup lang="ts">
const props = defineProps<{
  data: any
}>()
</script>

<template>
  <ul
    text-sm text-purple-700 dark:text-purple-300
  >
    <li>
      <span text="[#486887]" dark="text-#7595b5">
        event info
      </span>
      <ul pl-2 pt-2>
        <li>
          <span text-purple-700 dark:text-purple-300>component</span>
          <span px-2 color="[#444]" dark="text-white">:</span>
          <span text="[#222]" dark="text-#c41a16">
            <span>"</span>
            <span>{{ data.name }}</span>
            <span>"</span>
          </span>
        </li>
        <li>
          <span text-purple-700 dark:text-purple-300>type</span>
          <span px-2 color="[#444]" dark="text-white">:</span>
          <span text="[#222]" dark="text-#c41a16">
            <span>"</span>
            <span>{{ data.type }}</span>
            <span>"</span>
          </span>
        </li>
        <li>
          <span text-purple-700 dark:text-purple-300>measure</span>
          <span px-2 color="[#444]" dark="text-white">:</span>
          <span text="[#222]" dark="text-#c41a16">
            <span>"</span>
            <span>{{ data.measure }}</span>
            <span>"</span>
          </span>
        </li>
        <li v-if="data.duration">
          <span text-purple-700 dark:text-purple-300>duration</span>
          <span px-2 color="[#444]" dark="text-white">:</span>
          <span text="[#222]" dark="text-#c41a16">
            <span>"</span>
            <span>{{ data.duration }}</span>
            <span>"</span>
          </span>
        </li>
      </ul>
    </li>
  </ul>
</template>
