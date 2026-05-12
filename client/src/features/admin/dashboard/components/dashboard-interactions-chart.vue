<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut, VisTooltip, VisDonutSelectors } from '@unovis/vue'
import { PieChart } from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'
import { EmptyState } from '@/ui/empty-state'

const props = defineProps<{
  data?: AnalyticsDomainModel.InteractionsStatsDto
}>()

type DonutDatum = { label: string; value: number; percent: number }

const COLORS = ['#7C3AED', '#F97316', '#3B82F6', '#22C55E']

const donutData = computed<DonutDatum[]>(() => {
  if (!props.data?.types?.length) return []
  return props.data.types.map((t) => ({
    label: t.typeLabel,
    value: t.scansCount,
    percent: t.sharePercent,
  }))
})

const topItem = computed(() => donutData.value[0] ?? null)

const valueAccessor = (d: DonutDatum) => d.value
const colorAccessor = (_d: DonutDatum, i: number) => COLORS[i % COLORS.length]

const donutTooltipTriggers = {
  [VisDonutSelectors.segment]: (d: { data: DonutDatum }) =>
    `<div style="background:#0f172a;border:1px solid #ffffff1a;border-radius:6px;padding:8px 12px;font-family:Inter,sans-serif">
      <div style="color:#94a3b8;font-size:11px;font-weight:500">${d.data.label}</div>
      <div style="color:#fafafa;font-size:13px;font-weight:600">${d.data.value.toLocaleString('fr-FR')} scans · ${parseFloat(d.data.percent.toFixed(2))}%</div>
    </div>`,
}
</script>

<template>
  <div class="flex w-full flex-col gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5 xl:w-[380px]">
    <p class="text-base font-semibold text-slate-50">Type d'interactions NFC</p>

    <template v-if="!donutData.length">
      <div class="flex h-36 items-center justify-center">
        <EmptyState :icon="PieChart" title="Aucune donnée" size="sm" />
      </div>
    </template>

    <template v-else>
      <!-- Donut chart + center overlay -->
      <div class="flex justify-center">
        <div class="relative" style="width: 144px; height: 144px">
          <VisSingleContainer :data="donutData" :width="144" :height="144">
            <VisDonut
              :value="valueAccessor"
              :arc-width="28"
              :pad-angle="0.02"
              :color="colorAccessor"
            />
            <VisTooltip :triggers="donutTooltipTriggers" />
          </VisSingleContainer>

          <!-- Center overlay -->
          <div
            v-if="topItem"
            class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          >
            <span class="text-lg font-bold text-slate-50">{{ parseFloat(topItem.percent.toFixed(2)) }}%</span>
            <span class="text-[10px] font-medium text-[#A78BFA]">{{ topItem.label }}</span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-col gap-2">
        <div
          v-for="(item, index) in donutData"
          :key="item.label"
          class="flex items-center gap-2"
        >
          <span
            class="h-2 w-2 shrink-0 rounded-full"
            :style="{ backgroundColor: COLORS[index % COLORS.length] }"
          />
          <span class="flex-1 text-[13px] text-slate-50">{{ item.label }}</span>
          <span class="text-[13px] font-medium text-slate-400">{{ parseFloat(item.percent.toFixed(2)) }}%</span>
        </div>
      </div>
    </template>
  </div>
</template>
