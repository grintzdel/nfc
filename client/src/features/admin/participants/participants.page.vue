<script setup lang="ts">
import { CheckCircle2, Eye, Pencil, Search, Trash2, Users } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import { useGetParticipantsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-participants-count'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import { useUnregisterParticipant } from '@/modules/participant/ui/hooks/queries/mutation/use-unregister-participant'
import { useUpdateParticipantProfile } from '@/modules/participant/ui/hooks/queries/mutation/use-update-participant-profile'
import { useGetPaginatedParticipants } from '@/modules/participant/ui/hooks/queries/query/use-get-paginated-participants'
import StatCard from '@/ui/components/stat-card.vue'
import { EmptyState } from '@/ui/empty-state'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'

import ConfirmDeleteParticipantDialog from './components/confirm-delete-participant-dialog.vue'
import ParticipantDetailDialog from './components/participant-detail-dialog.vue'
import ParticipantEditDialog from './components/participant-edit-dialog.vue'

const TABS = [
  { key: 'all', label: 'Tous', checkedIn: undefined as boolean | undefined },
  { key: 'in', label: 'Checked-in', checkedIn: true },
  { key: 'not', label: 'Pas encore arrivés', checkedIn: false },
]

const activeTab = ref<'all' | 'in' | 'not'>('all')
const checkedIn = computed<boolean | undefined>(() => TABS.find((t) => t.key === activeTab.value)?.checkedIn)

const page = ref(1)
const limit = ref(20)
const searchInput = ref('')
const search = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    search.value = value
    page.value = 1
  }, 300)
})

watch(activeTab, () => {
  page.value = 1
})

const { data: paged, isLoading } = useGetPaginatedParticipants({ page, limit, checkedIn, search })
const { data: countStats } = useGetParticipantsCount()

const items = computed(() => paged.value?.items ?? [])

const updateMutation = useUpdateParticipantProfile()
const deleteMutation = useUnregisterParticipant()

const detailOpen = ref(false)
const editOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref<ParticipantDomainModel.MyParticipationDto | null>(null)

function handleView(p: ParticipantDomainModel.MyParticipationDto): void {
  selected.value = p
  detailOpen.value = true
}

function handleEdit(p: ParticipantDomainModel.MyParticipationDto): void {
  selected.value = p
  editOpen.value = true
}

function handleEditConfirm(payload: { displayName: string; role: string | null; bio: string | null }): void {
  if (!selected.value) return
  updateMutation.mutate(
    { id: selected.value.id, dto: payload },
    {
      onSuccess: () => {
        toast.success('Participant mis à jour')
        editOpen.value = false
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'),
    }
  )
}

function handleDelete(p: ParticipantDomainModel.MyParticipationDto): void {
  selected.value = p
  deleteOpen.value = true
}

function handleDeleteConfirm(): void {
  if (!selected.value) return
  deleteMutation.mutate(selected.value.id, {
    onSuccess: () => {
      toast.success('Participant supprimé')
      deleteOpen.value = false
      selected.value = null
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression'),
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
</script>

<template>
  <AdminLayout title="Participants" subtitle="Vue globale des participants à travers tous les événements">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          :icon="Users"
          icon-color="#3B82F6"
          title="Participants total"
          :value="countStats?.count?.toLocaleString('fr-FR') ?? '—'"
          :badge="
            countStats?.rateVsLastMonth != null
              ? `${countStats.rateVsLastMonth >= 0 ? '+' : ''}${parseFloat(countStats.rateVsLastMonth.toFixed(2))}% vs mois dernier`
              : undefined
          "
          :badge-variant="(countStats?.rateVsLastMonth ?? 0) >= 0 ? 'positive' : 'negative'"
        />
        <StatCard
          :icon="CheckCircle2"
          icon-color="#22C55E"
          title="Sur cette vue"
          :value="paged?.total?.toLocaleString('fr-FR') ?? '—'"
          :badge="
            activeTab === 'in'
              ? 'Checked-in uniquement'
              : activeTab === 'not'
                ? 'Non checked-in uniquement'
                : 'Toutes participations'
          "
          badge-variant="positive"
        />
      </div>

      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <div class="flex items-center px-6 pt-4">
          <div class="flex items-center gap-0.5 rounded-md bg-slate-800 p-0.5">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              type="button"
              class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'border border-white/10 bg-[#0F172A] text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              "
              @click="activeTab = tab.key as 'all' | 'in' | 'not'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3 px-6 py-4">
          <div class="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#0F172A] px-3 py-2">
            <Search class="h-3.5 w-3.5 text-slate-400" />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Rechercher par nom ou rôle…"
              class="w-full bg-transparent text-[13px] text-slate-50 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <EmptyState
          v-if="paged && paged.total === 0"
          :icon="Users"
          title="Aucun participant trouvé"
          :description="
            search ? 'Essayez une autre recherche.' : 'Les participants apparaîtront ici dès leur première inscription.'
          "
          size="sm"
        />

        <template v-else>
          <div class="overflow-x-auto">
            <div class="flex min-w-[880px] flex-col">
              <div class="flex items-center bg-slate-800">
                <div class="flex-1 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Participant</span>
                </div>
                <div class="flex-1 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Événement</span>
                </div>
                <div class="w-[110px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Inscrit le</span>
                </div>
                <div class="w-[90px] shrink-0 px-4 py-3 text-center">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Check-in</span>
                </div>
                <div class="flex w-[140px] shrink-0 items-center justify-end px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Actions</span>
                </div>
              </div>

              <div v-for="p in items" :key="p.id" class="flex items-center border-t border-white/10">
                <div class="flex flex-1 items-center gap-3 px-4 py-3">
                  <div
                    class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[11px] font-semibold text-white"
                  >
                    {{ initials(p.profile.displayName) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-50">{{ p.profile.displayName }}</span>
                    <span v-if="p.profile.role" class="text-xs text-slate-400">{{ p.profile.role }}</span>
                  </div>
                </div>
                <div class="flex-1 px-4 py-3 text-sm">
                  <RouterLink
                    v-if="p.event"
                    :to="`/admin/events/${p.event.id}`"
                    class="text-violet-300 hover:text-violet-200"
                  >
                    {{ p.event.name }}
                  </RouterLink>
                  <span v-else class="text-slate-500">Événement supprimé</span>
                </div>
                <div class="w-[110px] shrink-0 px-4 py-3 text-sm text-slate-300">{{ formatDate(p.registeredAt) }}</div>
                <div class="w-[90px] shrink-0 px-4 py-3 text-center">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-full"
                    :class="p.checkedInAt ? 'bg-emerald-400' : 'bg-slate-600'"
                    :title="p.checkedInAt ? `Arrivé le ${formatDate(p.checkedInAt)}` : 'Pas encore arrivé'"
                  />
                </div>
                <div class="flex w-[140px] shrink-0 items-center justify-end gap-1 px-4 py-3">
                  <button
                    type="button"
                    class="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/5"
                    title="Voir le détail"
                    :aria-label="`Voir ${p.profile.displayName}`"
                    @click="handleView(p)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/5"
                    title="Modifier le profil"
                    :aria-label="`Modifier ${p.profile.displayName}`"
                    @click="handleEdit(p)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    :disabled="deleteMutation.isPending.value"
                    class="rounded-md border border-red-500/40 p-1.5 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Supprimer"
                    :aria-label="`Supprimer ${p.profile.displayName}`"
                    @click="handleDelete(p)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
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
            item-label="participants"
            @update:page="(p) => (page = p)"
          />
        </template>
      </div>
    </div>

    <ParticipantDetailDialog :open="detailOpen" :participant="selected" @update:open="(v) => (detailOpen = v)" />

    <ParticipantEditDialog
      :open="editOpen"
      :participant="selected"
      :loading="updateMutation.isPending.value"
      @update:open="(v) => (editOpen = v)"
      @confirm="handleEditConfirm"
    />

    <ConfirmDeleteParticipantDialog
      :open="deleteOpen"
      :display-name="selected?.profile.displayName"
      :loading="deleteMutation.isPending.value"
      @update:open="(v) => (deleteOpen = v)"
      @confirm="handleDeleteConfirm"
    />
  </AdminLayout>
</template>
