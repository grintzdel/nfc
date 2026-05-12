<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { ScanLine } from 'lucide-vue-next'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'
import { EmptyState } from '@/ui/empty-state'
import { useGetPaginatedCheckInsByEvent } from '@/modules/check-in/ui/hooks/queries/query/use-get-paginated-check-ins-by-event'
import { InteractionType } from '@/modules/check-in/core/model/check-in.domain-model'
import type { AnalyticsDomainModel } from '@/modules/analytics/core/model/analytics.domain-model'

const props = defineProps<{
  eventId: string
  stats: AnalyticsDomainModel.EventDetailStatsDto
}>()

const eventIdRef = toRef(props, 'eventId') as unknown as import('vue').Ref<string | null>
const page = ref(1)
const limit = ref(20)
const enabled = ref(true)

const { data: paged, isLoading } = useGetPaginatedCheckInsByEvent({
  eventId: eventIdRef,
  page,
  limit,
  enabled,
})

const items = computed(() => paged.value?.items ?? [])

const INTERACTION_LABEL: Record<string, string> = {
  [InteractionType.CHECK_IN]: 'Entrée',
  [InteractionType.NETWORKING]: 'Networking',
  [InteractionType.VOTE]: 'Vote',
  [InteractionType.CASHLESS]: 'Paiement',
}

const INTERACTION_CLASS: Record<string, string> = {
  [InteractionType.CHECK_IN]: 'bg-emerald-500/20 text-emerald-300',
  [InteractionType.NETWORKING]: 'bg-violet-500/20 text-violet-300',
  [InteractionType.VOTE]: 'bg-amber-500/20 text-amber-300',
  [InteractionType.CASHLESS]: 'bg-cyan-500/20 text-cyan-300',
}

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const lastCheckInRelative = computed(() => {
  if (!props.stats.lastCheckInAt) return '—'
  const diff = Date.now() - new Date(props.stats.lastCheckInAt).getTime()
  const min = Math.round(diff / 60_000)
  if (min < 1) return "À l'instant"
  if (min < 60) return `il y a ${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `il y a ${hr} h`
  return `il y a ${Math.round(hr / 24)} j`
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Total check-ins</span>
        <span class="text-2xl font-semibold text-slate-50">{{ stats.checkInCount }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Participants uniques</span>
        <span class="text-2xl font-semibold text-slate-50">{{ stats.uniqueParticipantsCheckedIn }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3">
        <span class="text-xs font-medium text-slate-400">Dernier</span>
        <span class="text-lg font-semibold text-slate-50">{{ lastCheckInRelative }}</span>
      </div>
    </div>

    <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
      <EmptyState
        v-if="paged && paged.total === 0"
        :icon="ScanLine"
        title="Aucun check-in enregistré"
        description="Les check-ins apparaîtront ici dès la première interaction sur place."
        size="sm"
      />

      <template v-else>
        <div class="overflow-x-auto">
          <div class="flex min-w-[680px] flex-col">
            <div class="flex items-center bg-slate-800">
              <div class="w-[180px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Date / heure</span></div>
              <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Participant</span></div>
              <div class="w-[140px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Type</span></div>
              <div class="w-[120px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Zone</span></div>
            </div>

            <div
              v-for="row in items"
              :key="row.id"
              class="flex items-center border-t border-white/10"
            >
              <div class="w-[180px] shrink-0 px-4 py-3 text-sm text-slate-300">{{ formatTimestamp(row.createdAt) }}</div>
              <div class="flex-1 px-4 py-3 text-sm">
                <span v-if="row.participant" class="text-slate-200">{{ row.participant.displayName }}</span>
                <span v-else class="text-slate-500">—</span>
              </div>
              <div class="w-[140px] shrink-0 px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="INTERACTION_CLASS[row.interactionType]"
                >
                  {{ INTERACTION_LABEL[row.interactionType] ?? row.interactionType }}
                </span>
              </div>
              <div class="w-[120px] shrink-0 px-4 py-3 text-sm text-slate-400">{{ row.zoneName ?? '—' }}</div>
            </div>

            <TableSkeleton v-if="isLoading && items.length === 0" :rows="5" :columns="4" />
          </div>
        </div>

        <Pagination
          v-if="paged"
          :page="paged.page"
          :total-pages="paged.totalPages"
          :total="paged.total"
          :limit="paged.limit"
          item-label="check-ins"
          @update:page="(p) => page = p"
        />
      </template>
    </div>
  </div>
</template>
