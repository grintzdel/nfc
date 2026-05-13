<script setup lang="ts">
import { Calendar, Users, Watch, TrendingUp } from 'lucide-vue-next'

import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'
import StatCard from '@/ui/components/stat-card.vue'

defineProps<{
  activeEvents?: AnalyticsDomainModel.ActiveEventsStatsDto
  participantsCount?: AnalyticsDomainModel.CountWithRateDto
  braceletsCount?: AnalyticsDomainModel.CountWithRateDto
  revenue?: AnalyticsDomainModel.RevenueWithRateDto
}>()

function formatRate(rate: number | null | undefined, prefix: string = ''): string | undefined {
  if (rate == null) return undefined
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${prefix}${parseFloat(rate.toFixed(2))}% vs mois dernier`
}

function formatDiff(diff: number | undefined): string | undefined {
  if (diff == null) return undefined
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff} vs mois dernier`
}

function rateVariant(rate: number | null | undefined): 'positive' | 'negative' {
  if (rate == null || rate >= 0) return 'positive'
  return 'negative'
}

const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
function formatRevenue(value: number | undefined): string {
  if (value == null) return '—'
  return eurFormatter.format(value)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard
      :icon="Calendar"
      icon-color="#7C3AED"
      title="Evenements actifs"
      :value="String(activeEvents?.count ?? '—')"
      :badge="formatDiff(activeEvents?.diffVsLastMonth)"
      :badge-variant="rateVariant(activeEvents?.diffVsLastMonth)"
    />
    <StatCard
      :icon="Users"
      icon-color="#3B82F6"
      title="Participants"
      :value="participantsCount?.count?.toLocaleString('fr-FR') ?? '—'"
      :badge="formatRate(participantsCount?.rateVsLastMonth)"
      :badge-variant="rateVariant(participantsCount?.rateVsLastMonth)"
    />
    <StatCard
      :icon="Watch"
      icon-color="#F97316"
      title="Bracelets NFC"
      :value="braceletsCount?.count?.toLocaleString('fr-FR') ?? '—'"
      :badge="formatRate(braceletsCount?.rateVsLastMonth)"
      :badge-variant="rateVariant(braceletsCount?.rateVsLastMonth)"
    />
    <StatCard
      :icon="TrendingUp"
      icon-color="#22C55E"
      title="Revenus"
      :value="formatRevenue(revenue?.revenue)"
      :badge="formatRate(revenue?.rateVsLastMonth)"
      :badge-variant="rateVariant(revenue?.rateVsLastMonth)"
    />
  </div>
</template>
