<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Calendar, MapPin, ExternalLink, Send, Play, CheckCircle2, XCircle, ScanLine } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import { EventStatus } from '@/modules/event/core/model/event.domain-model'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'
import type { EventStatusAction } from '@/modules/event/ui/hooks/queries/mutation/use-event-status-transition'

const props = defineProps<{
  event: EventDomainModel.EventOverviewDto
  stats: AnalyticsDomainModel.EventDetailStatsDto
  loading?: boolean
}>()

const emit = defineEmits<{ action: [EventStatusAction] }>()

type ActionDescriptor = { action: EventStatusAction; label: string; icon: Component; variant: 'primary' | 'danger' }

const STATUS_ACTIONS: Record<EventStatus, ActionDescriptor[]> = {
  [EventStatus.DRAFT]: [{ action: 'publish', label: 'Publier', icon: Send, variant: 'primary' }],
  [EventStatus.UPCOMING]: [
    { action: 'start', label: 'Démarrer', icon: Play, variant: 'primary' },
    { action: 'cancel', label: 'Annuler', icon: XCircle, variant: 'danger' },
  ],
  [EventStatus.IN_PROGRESS]: [{ action: 'complete', label: 'Clôturer', icon: CheckCircle2, variant: 'primary' }],
  [EventStatus.COMPLETED]: [],
  [EventStatus.CANCELLED]: [],
}

const STATUS_LABEL: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'Brouillon',
  [EventStatus.UPCOMING]: 'À venir',
  [EventStatus.IN_PROGRESS]: 'En cours',
  [EventStatus.COMPLETED]: 'Terminé',
  [EventStatus.CANCELLED]: 'Annulé',
}

const STATUS_CLASS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'bg-slate-500/20 text-slate-400',
  [EventStatus.UPCOMING]: 'bg-orange-500/20 text-orange-400',
  [EventStatus.IN_PROGRESS]: 'bg-[#7C3AED] text-white',
  [EventStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-400',
  [EventStatus.CANCELLED]: 'bg-red-500/20 text-red-400',
}

const actions = computed(() => STATUS_ACTIONS[props.event.status] ?? [])

const dateRange = computed(() => {
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const start = new Date(props.event.startsAt)
  const end = new Date(props.event.endsAt)
  return start.toDateString() === end.toDateString()
    ? fmt.format(start)
    : `${fmt.format(start)} → ${fmt.format(end)}`
})

const fillPercent = computed(() => Math.round(props.stats.capacityFillRate * 100))

const lastCheckInLabel = computed(() => {
  if (!props.stats.lastCheckInAt) return '—'
  const date = new Date(props.stats.lastCheckInAt)
  const diffMin = Math.round((Date.now() - date.getTime()) / 60_000)
  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `il y a ${diffHour} h`
  const diffDay = Math.round(diffHour / 24)
  return `il y a ${diffDay} j`
})
</script>

<template>
  <header class="flex flex-col gap-5 rounded-lg border border-white/10 bg-[#0F172A] p-6">
    <!-- Top row: title + status + actions -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-semibold text-slate-50">{{ event.name }}</h1>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
            :class="STATUS_CLASS[event.status]"
          >
            {{ STATUS_LABEL[event.status] }}
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
          <span class="inline-flex items-center gap-1.5">
            <MapPin class="h-3.5 w-3.5" />
            {{ event.venueName }} — {{ event.city }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <Calendar class="h-3.5 w-3.5" />
            {{ dateRange }}
          </span>
          <RouterLink
            :to="`/events/${event.slug}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
          >
            Page publique
            <ExternalLink class="h-3.5 w-3.5" />
          </RouterLink>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <RouterLink
          :to="`/admin/events/${event.id}/scanner`"
          class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 px-3.5 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
        >
          <ScanLine class="h-3.5 w-3.5" />
          Ouvrir le scanner
        </RouterLink>
        <button
          v-for="a in actions"
          :key="a.action"
          type="button"
          :disabled="loading"
          class="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-semibold disabled:opacity-50"
          :class="
            a.variant === 'primary'
              ? 'bg-[#8B5CF6] text-violet-50 hover:bg-violet-500'
              : 'border border-red-500/40 text-red-300 hover:bg-red-500/10'
          "
          @click="emit('action', a.action)"
        >
          <component :is="a.icon" class="h-3.5 w-3.5" />
          {{ a.label }}
        </button>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Participants</span>
        <span class="text-lg font-semibold text-slate-50">
          {{ stats.participantCount }}<span class="text-slate-500"> / {{ stats.capacity }}</span>
        </span>
        <span class="text-xs text-slate-500">{{ fillPercent }}% du quota</span>
      </div>
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Bracelets actifs</span>
        <span class="text-lg font-semibold text-slate-50">{{ stats.braceletsActiveCount }}</span>
        <span class="text-xs text-slate-500">sur {{ stats.braceletsAttachedCount }} attribués</span>
      </div>
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Check-ins</span>
        <span class="text-lg font-semibold text-slate-50">{{ stats.checkInCount }}</span>
        <span class="text-xs text-slate-500">{{ stats.uniqueParticipantsCheckedIn }} uniques</span>
      </div>
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Dernier check-in</span>
        <span class="text-lg font-semibold text-slate-50">{{ lastCheckInLabel }}</span>
      </div>
    </div>
  </header>
</template>
