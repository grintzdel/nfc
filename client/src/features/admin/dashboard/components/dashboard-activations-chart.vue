<script setup lang="ts">
import { VisXYContainer, VisStackedBar, VisAxis, VisTooltip, VisStackedBarSelectors } from '@unovis/vue'
import { BarChart3 } from 'lucide-vue-next'
import { computed } from 'vue'

import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'
import { EmptyState } from '@/ui/empty-state'

const props = defineProps<{
  data?: AnalyticsDomainModel.ActivationsByYearDto
}>()

type BarDatum = { month: string; activations: number }

const chartData = computed<BarDatum[]>(() => {
  if (!props.data) return []
  return props.data.months.map((m) => ({ month: m.monthName, activations: m.activations }))
})

const xAccessor = (_d: BarDatum, i: number) => i
const yAccessor = (d: BarDatum) => d.activations
const colorAccessor = () => '#8b5cf6'

const tickFormat = (_tick: number | Date, i: number) => chartData.value[i]?.month ?? ''

const barTooltipTriggers = {
  [VisStackedBarSelectors.bar]: (d: { datum: BarDatum }) =>
    `<div style="background:#020617;border:1px solid #334155;border-radius:6px;padding:6px 10px;font-family:Inter,sans-serif">
      <div style="color:#94a3b8;font-size:10px;font-weight:500">${d.datum.month} ${props.data?.year ?? ''}</div>
      <div style="color:#fafafa;font-size:12px;font-weight:700">${d.datum.activations.toLocaleString('fr-FR')} activations</div>
    </div>`,
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5">
    <h2 class="text-base font-semibold text-slate-50">Activations bracelets NFC</h2>

    <div v-if="!data || data.months.length === 0" class="flex h-56 items-center justify-center">
      <EmptyState :icon="BarChart3" title="Aucune donnée" size="sm" />
    </div>

    <div v-else class="h-56">
      <VisXYContainer :data="chartData" :height="224">
        <VisStackedBar :x="xAccessor" :y="yAccessor" :color="colorAccessor" :rounded-corners="4" :bar-padding="0.3" />
        <VisTooltip :triggers="barTooltipTriggers" />
        <VisAxis
          type="x"
          :tick-format="tickFormat"
          :num-ticks="chartData.length"
          :grid-line="false"
          tick-text-color="#94a3b8"
          :tick-text-font-size="'12px'"
        />
      </VisXYContainer>
    </div>
  </div>
</template>
