<script setup lang="ts">
import Skeleton from './Skeleton.vue'

withDefaults(defineProps<{ count?: number }>(), { count: 3 })
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    <div
      v-for="i in count"
      :key="i"
      class="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0F172A] p-5"
    >
      <div class="flex items-start justify-between gap-2">
        <Skeleton class="h-5 w-2/3" />
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
      <Skeleton class="h-3 w-1/2" />
      <Skeleton class="h-3 w-3/4" />
      <Skeleton class="mt-2 h-9 w-full" />
    </div>
  </div>
</template>
