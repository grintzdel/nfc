<script setup lang="ts">
import { computed } from 'vue'
import { TriangleAlert, Truck, CalendarClock, Plus } from 'lucide-vue-next'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

const props = defineProps<{
  data?: AnalyticsDomainModel.BraceletStockStatsDto
}>()

const barColor = computed(() => (props.data?.level === 'low' ? '#F97316' : '#8b5cf6'))
const barWidth = computed(() => `${props.data?.fillPercent ?? 0}%`)

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="flex w-full flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#0F172A] p-5 xl:w-[380px]">
    <!-- Empty state -->
    <div v-if="!data" class="flex h-60 items-center justify-center text-sm text-slate-400">
      Aucune donnee de stock
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <span class="text-base font-semibold text-slate-50">Stock bracelets</span>
          <span class="text-xs text-slate-400">Inventaire global</span>
        </div>
        <span
          v-if="data.level === 'low'"
          class="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-1 text-[11px] font-semibold text-orange-500"
        >
          <TriangleAlert class="h-3 w-3" />
          Seuil bas
        </span>
      </div>

      <!-- Stock value -->
      <div class="flex flex-col gap-2">
        <!-- Row: label + value + percent -->
        <div class="flex items-end justify-between">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-slate-400">Bracelets en stock</span>
            <div class="flex items-baseline gap-1">
              <span class="text-[28px] font-bold text-slate-50">{{ data.current }}</span>
              <span class="text-sm text-slate-400">/ {{ data.maxCapacity }}</span>
            </div>
          </div>
          <span class="text-[13px] font-semibold" :style="{ color: barColor }">{{ parseFloat(data.fillPercent.toFixed(2)) }}%</span>
        </div>

        <!-- Progress bar -->
        <div class="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full transition-all"
            :style="{ width: barWidth, backgroundColor: barColor }"
          />
        </div>

        <!-- Threshold row -->
        <div class="flex justify-between text-[10px] text-slate-400">
          <span>0</span>
          <span class="font-medium text-[#A78BFA]">Seuil · 500</span>
          <span>{{ data.maxCapacity }}</span>
        </div>
      </div>

      <!-- Pending order -->
      <div v-if="data.pendingOrder" class="flex flex-col gap-2 rounded-md bg-slate-800 p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Truck class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-xs text-slate-400">Commande en cours</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ data.pendingOrder.units }} unites</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <CalendarClock class="h-3.5 w-3.5 text-[#A78BFA]" />
            <span class="text-xs text-slate-400">Livraison estimee</span>
          </div>
          <span class="text-xs font-semibold text-slate-50">{{ formatDate(data.pendingOrder.estimatedDeliveryDate) }}</span>
        </div>
      </div>

      <!-- CTA (disabled until /admin/supply-orders ships) -->
      <button
        type="button"
        disabled
        title="Bientôt disponible"
        class="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-white/10 bg-slate-800/50 px-3.5 py-2.5 text-[13px] font-semibold text-slate-500"
      >
        <Plus class="h-3.5 w-3.5" />
        Commander des packs
        <span class="ml-1 rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Soon
        </span>
      </button>
    </template>
  </div>
</template>
