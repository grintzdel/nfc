<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  Timer,
  Package,
  CircleCheck,
  Users,
  MapPin,
  Calendar,
  UsersRound,
  MonitorPlay,
} from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'
import { EmptyState } from '@/ui/empty-state'

defineProps<{
  data?: AnalyticsDomainModel.NextEventStatsDto
}>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}
</script>

<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg border border-white/10 bg-[#0F172A] p-5"
  >
    <!-- Empty state -->
    <div v-if="!data?.event" class="flex h-60 items-center justify-center">
      <EmptyState
        :icon="Calendar"
        title="Aucun événement à venir"
        description="Créez votre prochain événement depuis la page Événements."
        size="sm"
      />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col gap-1.5">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-400">
          Prochain événement
        </p>
        <p class="text-lg font-bold text-slate-50">{{ data.event.name }}</p>
        <span
          class="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/15 px-2.5 py-0.5"
        >
          <Timer class="h-3 w-3 text-[#A78BFA]" />
          <span class="text-xs font-semibold text-[#A78BFA]"
            >J-{{ data.event.daysUntil }} ·
            {{ formatDate(data.event.startsAt) }}</span
          >
        </span>
      </div>

      <!-- KPI row (3 KPIs — used to be 4 with a "Livrés" duplicate of "Commandés") -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-md bg-slate-800 p-3">
          <p class="text-[11px] font-medium text-slate-400">Bracelets commandés</p>
          <div class="mt-1 flex items-center gap-1.5">
            <Package class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.braceletsOrdered }}</span>
          </div>
        </div>
        <div class="rounded-md bg-slate-800 p-3">
          <p class="text-[11px] font-medium text-slate-400">Pré-activés</p>
          <div class="mt-1 flex items-center gap-1.5">
            <CircleCheck class="h-3.5 w-3.5 text-orange-500" />
            <span class="text-lg font-bold text-slate-50">{{ data.event.braceletsPreActivated }}</span>
          </div>
        </div>
        <div class="rounded-md bg-slate-800 p-3">
          <p class="text-[11px] font-medium text-slate-400">Taux de remplissage</p>
          <div class="mt-1 flex items-center gap-1.5">
            <Users class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-lg font-bold text-slate-50">{{ parseFloat(data.event.fillRate.toFixed(2)) }}%</span>
          </div>
        </div>
      </div>

      <!-- Meta info -->
      <div class="flex flex-col gap-2 rounded-md bg-slate-800 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <MapPin class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-xs text-slate-400">Lieu</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ data.event.city || 'À définir' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Calendar class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-xs text-slate-400">Horaires</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.event.startsAt) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UsersRound class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-xs text-slate-400">Staff affecté</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ data.event.staffCount || '—' }}</span>
        </div>
      </div>

      <!-- CTA — links to the event detail page (the "centre de contrôle" we built in Phase 1-5) -->
      <RouterLink
        :to="`/admin/events/${data.event.id}`"
        class="flex w-full items-center justify-center gap-2 rounded-md bg-[#7C3AED] px-3.5 py-2.5 text-[13px] font-semibold text-violet-50 hover:bg-[#5B21B6]"
      >
        <MonitorPlay class="h-3.5 w-3.5" />
        Ouvrir le centre de contrôle
      </RouterLink>
    </template>
  </div>
</template>
