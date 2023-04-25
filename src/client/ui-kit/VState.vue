<script setup lang="ts">
const isExpanded = ref<boolean>(true)
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function add(a, b) {
  return a + b
}

const data = {
  key: 'event info',
  value: {
    name: 'webfansplz',
    age: 18,
    address: {
      city: 'shanghai',
      street: 'nanjing road',
    },
    list: [
      1, 2, 3, 4, 5, { name: 'boom' },
    ],
    add,
    map: new Map([['a', 1], ['b', 2]]),
    a: null,
    b: undefined,
    c: ref(2),
    // d: computed(() => ({ name: 'boom!!!' })),
  },
}
</script>

<template>
  <div>
    <h3
      flex cursor-pointer items-center rounded py-1
      class="hover:bg-[#c2e9d7] hover:dark:bg-[#2c3e50]"
      @click="toggleExpanded"
    >
      <VExpandLogo :value="isExpanded" />
      <span text-primary>
        {{ data.key }}
      </span>
    </h3>
    <div pl-3>
      <VStateType :data="data.value" />
    </div>
  </div>
</template>
