<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback } from '@/ui/avatar'

const props = defineProps<{
  displayName: string
  role: string | null
  eventName: string
  startsAt: string
  endsAt: string
}>()

const initials = computed(() =>
  props.displayName
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || '?',
)

const dateRange = computed(() => {
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt.format(new Date(props.startsAt))} → ${fmt.format(new Date(props.endsAt))}`
})
</script>

<template>
  <header class="flex flex-col items-center gap-4 text-center">
    <Avatar class="h-24 w-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30">
      <AvatarFallback class="bg-transparent text-3xl font-bold text-white">{{ initials }}</AvatarFallback>
    </Avatar>
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-white">{{ displayName }}</h1>
      <p v-if="role" class="text-sm text-slate-300">{{ role }}</p>
      <p class="text-xs uppercase tracking-wider text-slate-500">{{ eventName }} · {{ dateRange }}</p>
    </div>
  </header>
</template>
