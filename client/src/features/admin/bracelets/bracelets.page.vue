<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ExternalLink, Eye, Plus, PowerOff, Search, TrendingUp, Trash2, Watch } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import { useGetBraceletsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-bracelets-count'
import { useGetStock } from '@/modules/analytics/ui/hooks/queries/query/use-get-stock'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import { BraceletStatus, type BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'
import { useCreateBracelet } from '@/modules/bracelet/ui/hooks/queries/mutation/use-create-bracelet'
import { useDeleteBracelet } from '@/modules/bracelet/ui/hooks/queries/mutation/use-delete-bracelet'
import { useGetPaginatedBracelets } from '@/modules/bracelet/ui/hooks/queries/query/use-get-paginated-bracelets'
import StatCard from '@/ui/components/stat-card.vue'
import { EmptyState } from '@/ui/empty-state'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'

import BraceletDetailDialog from './components/bracelet-detail-dialog.vue'
import ConfirmDeleteBraceletDialog from './components/confirm-delete-bracelet-dialog.vue'
import ConfirmDisableBraceletDialog from './components/confirm-disable-bracelet-dialog.vue'
import CreateBraceletDialog from './components/create-bracelet-dialog.vue'

const { braceletPort } = useDependencies()
const queryClient = useQueryClient()

const STATUS_TABS = [
  { key: '', label: 'Tous' },
  { key: BraceletStatus.STOCK, label: 'Stock' },
  { key: BraceletStatus.PRE_ACTIVATED, label: 'Pré-activés' },
  { key: BraceletStatus.ACTIVE, label: 'Actifs' },
  { key: BraceletStatus.DISABLED, label: 'Désactivés' },
]

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

const page = ref(1)
const limit = ref(20)
const status = ref('')
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

watch(status, () => {
  page.value = 1
})

const { data: paged, isLoading } = useGetPaginatedBracelets({ page, limit, status, search })
const { data: braceletsCount } = useGetBraceletsCount()
const { data: stock } = useGetStock()

const items = computed(() => paged.value?.items ?? [])

const createOpen = ref(false)
const createMutation = useCreateBracelet()
function handleCreate(payload: { nfcId: string; productId?: string }): void {
  createMutation.mutate(payload, {
    onSuccess: () => {
      toast.success('Bracelet créé')
      createOpen.value = false
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la création'),
  })
}

const disableMutation = useMutation({
  mutationKey: ['disableBraceletGlobal'],
  mutationFn: (id: string) => braceletPort.disable(id),
  onSuccess: () => {
    toast.success('Bracelet désactivé')
    disableOpen.value = false
    selected.value = null
    queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    queryClient.invalidateQueries({ queryKey: ['analytics'] })
  },
  onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la désactivation'),
})

const deleteMutation = useDeleteBracelet()

const detailOpen = ref(false)
const disableOpen = ref(false)
const deleteOpen = ref(false)
const selected = ref<BraceletDomainModel.BraceletOverviewDto | null>(null)

function handleView(row: BraceletDomainModel.BraceletOverviewDto): void {
  selected.value = row
  detailOpen.value = true
}

function handleDisable(row: BraceletDomainModel.BraceletOverviewDto): void {
  selected.value = row
  disableOpen.value = true
}

function handleDisableConfirm(): void {
  if (!selected.value) return
  disableMutation.mutate(selected.value.id)
}

function handleDelete(row: BraceletDomainModel.BraceletOverviewDto): void {
  selected.value = row
  deleteOpen.value = true
}

function handleDeleteConfirm(): void {
  if (!selected.value) return
  deleteMutation.mutate(selected.value.id, {
    onSuccess: () => {
      toast.success('Bracelet supprimé')
      deleteOpen.value = false
      selected.value = null
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression'),
  })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AdminLayout title="Bracelets" subtitle="Inventaire global et gestion du stock NFC">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          :icon="Watch"
          icon-color="#F97316"
          title="Bracelets NFC"
          :value="braceletsCount?.count?.toLocaleString('fr-FR') ?? '—'"
          :badge="
            braceletsCount?.rateVsLastMonth != null
              ? `${braceletsCount.rateVsLastMonth >= 0 ? '+' : ''}${parseFloat(braceletsCount.rateVsLastMonth.toFixed(2))}% vs mois dernier`
              : undefined
          "
          :badge-variant="(braceletsCount?.rateVsLastMonth ?? 0) >= 0 ? 'positive' : 'negative'"
        />
        <StatCard
          :icon="TrendingUp"
          icon-color="#7C3AED"
          title="Stock disponible"
          :value="
            stock ? `${stock.current.toLocaleString('fr-FR')} / ${stock.maxCapacity.toLocaleString('fr-FR')}` : '—'
          "
          :badge="stock ? `${parseFloat(stock.fillPercent.toFixed(2))}% du seuil max` : undefined"
          :badge-variant="(stock?.level ?? 'mid') === 'low' ? 'negative' : 'positive'"
        />
      </div>

      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <div class="flex items-center px-6 pt-4">
          <div class="flex items-center gap-0.5 rounded-md bg-slate-800 p-0.5">
            <button
              v-for="tab in STATUS_TABS"
              :key="tab.key"
              type="button"
              class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
              :class="
                status === tab.key
                  ? 'border border-white/10 bg-[#0F172A] text-slate-50'
                  : 'text-slate-400 hover:text-slate-200'
              "
              @click="status = tab.key"
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
              placeholder="Rechercher par NFC ID…"
              class="w-full bg-transparent text-[13px] text-slate-50 outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-md bg-[#8B5CF6] px-4 py-2 hover:bg-violet-500"
            @click="createOpen = true"
          >
            <Plus class="h-3.5 w-3.5 text-violet-50" />
            <span class="text-[13px] font-semibold text-violet-50">Nouveau bracelet</span>
          </button>
        </div>

        <EmptyState
          v-if="paged && paged.total === 0"
          :icon="Watch"
          title="Aucun bracelet trouvé"
          :description="search ? 'Essayez une autre recherche.' : 'Créez votre premier bracelet pour démarrer.'"
          size="sm"
        />

        <template v-else>
          <div class="overflow-x-auto">
            <div class="flex min-w-[920px] flex-col">
              <div class="flex items-center bg-slate-800">
                <div class="w-[260px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">NFC ID</span>
                </div>
                <div class="w-[120px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Statut</span>
                </div>
                <div class="flex-1 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Événement</span>
                </div>
                <div class="w-[120px] shrink-0 px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Créé le</span>
                </div>
                <div class="flex w-[160px] shrink-0 items-center justify-end px-4 py-3">
                  <span class="text-xs font-semibold tracking-wide text-slate-400">Actions</span>
                </div>
              </div>

              <div v-for="row in items" :key="row.id" class="flex items-center border-t border-white/10">
                <div class="w-[260px] shrink-0 px-4 py-3">
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
                    {{ STATUS_LABEL[row.status] ?? row.status }}
                  </span>
                </div>
                <div class="flex-1 px-4 py-3 text-sm">
                  <RouterLink
                    v-if="row.eventId"
                    :to="`/admin/events/${row.eventId}`"
                    class="text-violet-300 hover:text-violet-200"
                  >
                    Voir l'événement
                  </RouterLink>
                  <span v-else class="text-slate-500">—</span>
                </div>
                <div class="w-[120px] shrink-0 px-4 py-3 text-sm text-slate-300">{{ formatDate(row.createdAt) }}</div>
                <div class="flex w-[160px] shrink-0 items-center justify-end gap-1 px-4 py-3">
                  <button
                    type="button"
                    class="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/5"
                    title="Voir le détail"
                    :aria-label="`Voir ${row.nfcId}`"
                    @click="handleView(row)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </button>
                  <button
                    v-if="row.status === BraceletStatus.ACTIVE || row.status === BraceletStatus.PRE_ACTIVATED"
                    type="button"
                    :disabled="disableMutation.isPending.value"
                    class="rounded-md border border-orange-500/40 p-1.5 text-orange-300 hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Désactiver"
                    :aria-label="`Désactiver ${row.nfcId}`"
                    @click="handleDisable(row)"
                  >
                    <PowerOff class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    :disabled="deleteMutation.isPending.value"
                    class="rounded-md border border-red-500/40 p-1.5 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Supprimer"
                    :aria-label="`Supprimer ${row.nfcId}`"
                    @click="handleDelete(row)"
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
            item-label="bracelets"
            @update:page="(p) => (page = p)"
          />
        </template>
      </div>
    </div>

    <CreateBraceletDialog
      :open="createOpen"
      :loading="createMutation.isPending.value"
      @update:open="(v) => (createOpen = v)"
      @confirm="handleCreate"
    />

    <BraceletDetailDialog :open="detailOpen" :bracelet="selected" @update:open="(v) => (detailOpen = v)" />

    <ConfirmDisableBraceletDialog
      :open="disableOpen"
      :nfc-id="selected?.nfcId"
      :loading="disableMutation.isPending.value"
      @update:open="(v) => (disableOpen = v)"
      @confirm="handleDisableConfirm"
    />

    <ConfirmDeleteBraceletDialog
      :open="deleteOpen"
      :nfc-id="selected?.nfcId"
      :loading="deleteMutation.isPending.value"
      @update:open="(v) => (deleteOpen = v)"
      @confirm="handleDeleteConfirm"
    />
  </AdminLayout>
</template>
