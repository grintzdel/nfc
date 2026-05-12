<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, ExternalLink, Link as LinkIcon } from 'lucide-vue-next'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'
import { useGetPaginatedParticipantsByEvent } from '@/modules/participant/ui/hooks/queries/query/use-get-paginated-participants-by-event'
import { useGetAvailableBracelets } from '@/modules/bracelet/ui/hooks/queries/query/use-get-available-bracelets'
import { useAttachBracelet } from '@/modules/participant/ui/hooks/queries/mutation/use-attach-bracelet'
import { BraceletStatus } from '@/modules/bracelet/core/model/bracelet.domain-model'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import AttachBraceletDialog from './attach-bracelet-dialog.vue'

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

const { data: paged, isLoading } = useGetPaginatedParticipantsByEvent({
  eventId: eventIdRef,
  page,
  limit,
  search: searchDebounced,
  enabled,
})

const { data: availableBracelets } = useGetAvailableBracelets(eventIdRef)

const attachMutation = useAttachBracelet(props.eventId)

const dialogOpen = ref(false)
const selectedParticipant = ref<ParticipantDomainModel.ParticipantOverviewDto | null>(null)

function openAttachDialog(p: ParticipantDomainModel.ParticipantOverviewDto): void {
  selectedParticipant.value = p
  dialogOpen.value = true
}

function handleConfirmAttach(payload: { participantId: string; braceletId: string }): void {
  attachMutation.mutate(payload, {
    onSuccess: () => {
      dialogOpen.value = false
    },
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

const items = computed(() => paged.value?.items ?? [])
const hasNoResults = computed(() => paged.value !== undefined && paged.value.total === 0 && !searchDebounced.value)
</script>

<template>
  <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
    <!-- Search bar -->
    <div class="flex items-center gap-3 px-6 py-4">
      <div class="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#0F172A] px-3 py-2">
        <Search class="h-3.5 w-3.5 text-slate-400" />
        <input
          v-model="searchInput"
          type="text"
          placeholder="Rechercher par nom ou rôle…"
          class="w-full bg-transparent text-[13px] text-slate-50 placeholder:text-slate-400 outline-none"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="hasNoResults" class="flex h-40 flex-col items-center justify-center gap-1 text-center">
      <p class="text-sm text-slate-300">Aucun participant inscrit pour cet événement.</p>
      <p class="text-xs text-slate-500">Lien public : /events/{{ eventId }}</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center bg-slate-800">
        <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Participant</span></div>
        <div class="w-[120px] px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Inscrit le</span></div>
        <div class="w-[180px] px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Bracelet</span></div>
        <div class="w-[100px] px-4 py-3 text-center"><span class="text-xs font-semibold tracking-wide text-slate-400">Check-in</span></div>
        <div class="w-[160px] px-4 py-3 text-right"><span class="text-xs font-semibold tracking-wide text-slate-400">Action</span></div>
      </div>

      <!-- Rows -->
      <div
        v-for="row in items"
        :key="row.id"
        class="flex items-center border-t border-white/10"
      >
        <div class="flex flex-1 items-center gap-3 px-4 py-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[11px] font-semibold text-white">
            {{ initials(row.profile.displayName) }}
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-slate-50">{{ row.profile.displayName }}</span>
            <span v-if="row.profile.role" class="text-xs text-slate-400">{{ row.profile.role }}</span>
          </div>
        </div>
        <div class="w-[120px] px-4 py-3 text-sm text-slate-300">{{ formatDate(row.registeredAt) }}</div>
        <div class="w-[180px] px-4 py-3">
          <RouterLink
            v-if="row.bracelet && row.bracelet.status === BraceletStatus.ACTIVE"
            :to="`/p/${row.bracelet.nfcId}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-300 hover:bg-emerald-500/30"
          >
            {{ row.bracelet.nfcId }}
            <ExternalLink class="h-3 w-3" />
          </RouterLink>
          <span
            v-else-if="row.bracelet && row.bracelet.status === BraceletStatus.PRE_ACTIVATED"
            class="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 font-mono text-xs text-violet-300"
          >
            <LinkIcon class="h-3 w-3" /> {{ row.bracelet.nfcId }}
          </span>
          <span
            v-else-if="row.bracelet && row.bracelet.status === BraceletStatus.DISABLED"
            class="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300"
          >
            Désactivé
          </span>
          <span v-else class="text-xs text-slate-500">Non attribué</span>
        </div>
        <div class="w-[100px] px-4 py-3 text-center">
          <span
            class="inline-block h-2.5 w-2.5 rounded-full"
            :class="row.checkedInAt ? 'bg-emerald-400' : 'bg-slate-600'"
            :title="row.checkedInAt ? 'Présent' : 'Pas encore arrivé'"
          />
        </div>
        <div class="flex w-[160px] items-center justify-end px-4 py-3">
          <button
            v-if="!row.bracelet"
            type="button"
            class="rounded-md border border-violet-500/40 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/10"
            @click="openAttachDialog(row)"
          >
            Attacher
          </button>
        </div>
      </div>

      <!-- Loading -->
      <TableSkeleton v-if="isLoading && items.length === 0" :rows="5" :columns="5" />

      <!-- Pagination -->
      <Pagination
        v-if="paged"
        :page="paged.page"
        :total-pages="paged.totalPages"
        :total="paged.total"
        :limit="paged.limit"
        item-label="participants"
        @update:page="(p) => page = p"
      />
    </template>

    <AttachBraceletDialog
      :participant="selectedParticipant"
      :available-bracelets="availableBracelets ?? []"
      :open="dialogOpen"
      :loading="attachMutation.isPending.value"
      @update:open="(v) => dialogOpen = v"
      @confirm="handleConfirmAttach"
    />
  </div>
</template>
