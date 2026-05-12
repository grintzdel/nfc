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
    <div class="relative">
      <span class="pointer-events-none absolute inset-0 -m-2 rounded-full bg-violet-500/20 blur-xl nfc-pulse" />
      <span class="pointer-events-none absolute inset-0 -m-4 rounded-full bg-fuchsia-500/10 blur-2xl nfc-pulse-delayed" />
      <Avatar class="relative h-24 w-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-2xl shadow-violet-500/40 ring-2 ring-white/10">
        <AvatarFallback class="bg-transparent text-3xl font-bold text-white">{{ initials }}</AvatarFallback>
      </Avatar>
    </div>
    <div class="flex flex-col gap-1">
      <h1 class="bg-gradient-to-br from-white to-slate-300 bg-clip-text text-2xl font-bold text-transparent">
        {{ displayName }}
      </h1>
      <p v-if="role" class="text-sm text-slate-300">{{ role }}</p>
      <p class="text-xs uppercase tracking-wider text-slate-500">{{ eventName }} · {{ dateRange }}</p>
    </div>
  </header>
</template>

<style scoped>
@keyframes nfc-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.08); }
}
.nfc-pulse {
  animation: nfc-pulse 2.6s ease-in-out infinite;
}
.nfc-pulse-delayed {
  animation: nfc-pulse 2.6s ease-in-out infinite;
  animation-delay: 0.8s;
}
</style>
