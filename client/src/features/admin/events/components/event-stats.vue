<script setup lang="ts">
import { CalendarDays, Clock4, Activity, CircleCheck } from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

defineProps<{
  data?: AnalyticsDomainModel.EventPageStatsDto
}>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <div class="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-[#0F172A] p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">Total evenements</span>
        <CalendarDays class="h-4 w-4 text-slate-400" />
      </div>
      <span class="text-2xl font-bold text-slate-50">{{ data?.totalEvents ?? '—' }}</span>
      <span
        v-if="data"
        class="text-[11px] font-medium"
        :class="data.diffVsLastMonth >= 0 ? 'text-emerald-500' : 'text-red-500'"
      >
        {{ data.diffVsLastMonth >= 0 ? '+' : '' }}{{ data.diffVsLastMonth }} ce mois
      </span>
    </div>

    <div class="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-[#0F172A] p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">A venir</span>
        <Clock4 class="h-4 w-4 text-orange-500" />
      </div>
      <span class="text-2xl font-bold text-slate-50">{{ data?.upcomingIn30Days ?? '—' }}</span>
      <span class="text-[11px] font-medium text-slate-400">Dans les 30 jours</span>
    </div>

    <div class="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-[#0F172A] p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">En cours</span>
        <Activity class="h-4 w-4 text-[#A78BFA]" />
      </div>
      <span class="text-2xl font-bold text-slate-50">{{ data?.inProgressCount ?? '—' }}</span>
      <span class="text-[11px] font-medium text-[#A78BFA]">Actifs aujourd'hui</span>
    </div>

    <div class="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-[#0F172A] p-5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400">Termines ({{ new Date().getFullYear() }})</span>
        <CircleCheck class="h-4 w-4 text-emerald-500" />
      </div>
      <span class="text-2xl font-bold text-slate-50">{{ data?.completedThisYear ?? '—' }}</span>
      <span v-if="data" class="text-[11px] font-medium text-emerald-500">
        {{ data.successRate }}% taux de succes
      </span>
    </div>
  </div>
</template>
