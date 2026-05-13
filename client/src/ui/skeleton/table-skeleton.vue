<script setup lang="ts">
import Skeleton from './skeleton.vue'

const props = withDefaults(
  defineProps<{
    rows?: number
    columns?: number
  }>(),
  { rows: 5, columns: 4 }
)
</script>

<template>
  <div class="flex flex-col divide-y divide-white/5">
    <div v-for="r in props.rows" :key="r" class="flex items-center gap-3 px-4 py-4">
      <Skeleton class="h-4 flex-1" />
      <Skeleton v-for="c in props.columns - 1" :key="c" class="h-4 w-20" />
    </div>
  </div>
</template>
