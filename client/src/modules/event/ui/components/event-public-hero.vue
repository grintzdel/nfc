<script setup lang="ts">
import { MapPin, Calendar } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  startsAt: string
  endsAt: string
  city: string
  venueName: string
}>()

const dateRange = computed(() => {
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const start = fmt.format(new Date(props.startsAt))
  const end = fmt.format(new Date(props.endsAt))
  return start === end ? start : `${start} — ${end}`
})
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 px-8 py-12 lg:px-14 lg:py-16"
  >
    <div class="absolute -top-20 right-0 h-64 w-64 rounded-full bg-violet-500/30 blur-3xl" />
    <div class="relative flex flex-col gap-4">
      <h1 class="text-3xl font-bold text-white lg:text-5xl">{{ name }}</h1>
      <div class="flex flex-wrap items-center gap-4 text-sm text-slate-300">
        <span class="flex items-center gap-1.5"><Calendar class="h-4 w-4" />{{ dateRange }}</span>
        <span class="flex items-center gap-1.5"><MapPin class="h-4 w-4" />{{ venueName }}, {{ city }}</span>
      </div>
    </div>
  </div>
</template>
