<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, ExternalLink, Watch } from 'lucide-vue-next'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'
import { EmptyState } from '@/ui/empty-state'
import { useGetPaginatedBraceletsByEvent } from '@/modules/bracelet/ui/hooks/queries/query/use-get-paginated-bracelets-by-event'
import { useDisableBracelet } from '@/modules/bracelet/ui/hooks/queries/mutation/use-disable-bracelet'
import { BraceletStatus } from '@/modules/bracelet/core/model/bracelet.domain-model'

const props = defineProps<{ eventId: string }>()

const eventIdRef = toRef(props, 'eventId') as unknown as import('vue').Ref<string | null>
const page = ref(1)
const limit = ref(20)
const searchInput = ref('')
const searchDebounced = ref('')
const enabled = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchDebounced.value = value
    page.value = 1
  }, 300)
})

const { data: paged, isLoading } = useGetPaginatedBraceletsByEvent({
  eventId: eventIdRef,
  page,
  limit,
  search: searchDebounced,
  enabled,
})

const disableMutation = useDisableBracelet(props.eventId)

function handleDisable(braceletId: string): void {
  if (!confirm('Désactiver ce bracelet ?')) return
  disableMutation.mutate(braceletId)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_LABEL: Record<string, string> = {
  [BraceletStatus.STOCK]: 'Stock',
  [BraceletStatus.PRE_ACTIVATED]: 'Pré-activé',
  [BraceletStatus.ACTIVE]: 'Actif',
  [BraceletStatus.DISABLED]: 'Désactivé',
}

const STATUS_CLASS: Record<string, string> = {
  [BraceletStatus.STOCK]: 'bg-slate-500/20 text-slate-300',
  [BraceletStatus.PRE_ACTIVATED]: 'bg-violet-500/20 text-violet-300',
  [BraceletStatus.ACTIVE]: 'bg-emerald-500/20 text-emerald-300',
  [BraceletStatus.DISABLED]: 'bg-red-500/20 text-red-300',
}

const items = computed(() => paged.value?.items ?? [])
const hasNoResults = computed(() => paged.value !== undefined && paged.value.total === 0 && !searchDebounced.value)
</script>

<template>
  <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
    <div class="flex items-center gap-3 px-6 py-4">
      <div class="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#0F172A] px-3 py-2">
        <Search class="h-3.5 w-3.5 text-slate-400" />
        <input
          v-model="searchInput"
          type="text"
          placeholder="Rechercher par NFC ID…"
          class="w-full bg-transparent text-[13px] text-slate-50 placeholder:text-slate-400 outline-none"
        />
      </div>
    </div>

    <EmptyState
      v-if="hasNoResults"
      :icon="Watch"
      title="Aucun bracelet attribué"
      description="Aucun bracelet n'a encore été attaché à un participant pour cet événement."
      size="sm"
    />

    <template v-else>
      <div class="overflow-x-auto">
        <div class="flex min-w-[820px] flex-col">
          <div class="flex items-center bg-slate-800">
            <div class="w-[220px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">NFC ID</span></div>
            <div class="w-[120px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Statut</span></div>
            <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Participant attaché</span></div>
            <div class="w-[120px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Créé le</span></div>
            <div class="w-[140px] shrink-0 px-4 py-3 text-right"><span class="text-xs font-semibold tracking-wide text-slate-400">Action</span></div>
          </div>

          <div
            v-for="row in items"
            :key="row.id"
            class="flex items-center border-t border-white/10"
          >
            <div class="w-[220px] shrink-0 px-4 py-3">
              <RouterLink
                v-if="row.status === BraceletStatus.ACTIVE"
                :to="`/p/${row.nfcId}`"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1 font-mono text-sm text-emerald-300 hover:text-emerald-200"
              >
                {{ row.nfcId }}
                <ExternalLink class="h-3 w-3" />
              </RouterLink>
              <span v-else class="font-mono text-sm text-slate-300">{{ row.nfcId }}</span>
            </div>
            <div class="w-[120px] shrink-0 px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="STATUS_CLASS[row.status]"
              >
                {{ STATUS_LABEL[row.status] }}
              </span>
            </div>
            <div class="flex-1 px-4 py-3 text-sm">
              <span v-if="row.participant" class="text-slate-200">{{ row.participant.displayName }}</span>
              <span v-else class="text-slate-500">—</span>
            </div>
            <div class="w-[120px] shrink-0 px-4 py-3 text-sm text-slate-300">{{ formatDate(row.createdAt) }}</div>
            <div class="flex w-[140px] shrink-0 items-center justify-end px-4 py-3">
              <button
                v-if="row.status === BraceletStatus.ACTIVE || row.status === BraceletStatus.PRE_ACTIVATED"
                type="button"
                :disabled="disableMutation.isPending.value"
                class="rounded-md border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                @click="handleDisable(row.id)"
              >
                Désactiver
              </button>
            </div>
          </div>

          <TableSkeleton v-if="isLoading && items.length === 0" :rows="5" :columns="5" />
        </div>
      </div>

      <Pagination
        v-if="paged"
        :page="paged.page"
        :total-pages="paged.totalPages"
        :total="paged.total"
        :limit="paged.limit"
        item-label="bracelets"
        @update:page="(p) => page = p"
      />
    </template>
  </div>
</template>
