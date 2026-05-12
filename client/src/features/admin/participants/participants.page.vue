<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, Users, CheckCircle2 } from 'lucide-vue-next'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import StatCard from '@/ui/components/stat-card.vue'
import { Pagination } from '@/ui/pagination'
import { TableSkeleton } from '@/ui/skeleton'
import { useGetPaginatedParticipants } from '@/modules/participant/ui/hooks/queries/query/use-get-paginated-participants'
import { useGetParticipantsCount } from '@/modules/analytics/ui/hooks/queries/query/use-get-participants-count'

const TABS = [
  { key: 'all', label: 'Tous', checkedIn: undefined as boolean | undefined },
  { key: 'in', label: 'Checked-in', checkedIn: true },
  { key: 'not', label: 'Pas encore arrivés', checkedIn: false },
]

const activeTab = ref<'all' | 'in' | 'not'>('all')
const checkedIn = computed<boolean | undefined>(
  () => TABS.find((t) => t.key === activeTab.value)?.checkedIn,
)

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

watch(activeTab, () => { page.value = 1 })

const { data: paged, isLoading } = useGetPaginatedParticipants({ page, limit, checkedIn, search })
const { data: countStats } = useGetParticipantsCount()

const items = computed(() => paged.value?.items ?? [])

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}
</script>

<template>
  <AdminLayout title="Participants" subtitle="Vue globale des participants à travers tous les événements">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <!-- Stats strip -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          :icon="Users"
          icon-color="#3B82F6"
          title="Participants total"
          :value="countStats?.count?.toLocaleString('fr-FR') ?? '—'"
          :badge="countStats?.rateVsLastMonth != null
            ? `${countStats.rateVsLastMonth >= 0 ? '+' : ''}${parseFloat(countStats.rateVsLastMonth.toFixed(2))}% vs mois dernier`
            : undefined"
          :badge-variant="(countStats?.rateVsLastMonth ?? 0) >= 0 ? 'positive' : 'negative'"
        />
        <StatCard
          :icon="CheckCircle2"
          icon-color="#22C55E"
          title="Sur cette vue"
          :value="paged?.total?.toLocaleString('fr-FR') ?? '—'"
          :badge="activeTab === 'in' ? 'Checked-in uniquement' : activeTab === 'not' ? 'Non checked-in uniquement' : 'Toutes participations'"
          badge-variant="positive"
        />
      </div>

      <!-- Table -->
      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <!-- Tabs -->
        <div class="flex items-center px-6 pt-4">
          <div class="flex items-center gap-0.5 rounded-md bg-slate-800 p-0.5">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              type="button"
              class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
              :class="
                activeTab === tab.key
                  ? 'bg-[#0F172A] text-slate-50 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              "
              @click="activeTab = tab.key as 'all' | 'in' | 'not'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Search -->
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

        <!-- Empty -->
        <div v-if="paged && paged.total === 0" class="flex h-40 items-center justify-center">
          <p class="text-sm text-slate-400">Aucun participant trouvé.</p>
        </div>

        <template v-else>
          <div class="overflow-x-auto">
            <div class="flex min-w-[720px] flex-col">
              <!-- Header -->
              <div class="flex items-center bg-slate-800">
                <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Participant</span></div>
                <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Événement</span></div>
                <div class="w-[110px] shrink-0 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Inscrit le</span></div>
                <div class="w-[110px] shrink-0 px-4 py-3 text-center"><span class="text-xs font-semibold tracking-wide text-slate-400">Check-in</span></div>
              </div>

              <!-- Rows -->
              <div v-for="p in items" :key="p.id" class="flex items-center border-t border-white/10">
                <div class="flex flex-1 items-center gap-3 px-4 py-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-[11px] font-semibold text-white">
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
                <div class="w-[110px] shrink-0 px-4 py-3 text-center">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-full"
                    :class="p.checkedInAt ? 'bg-emerald-400' : 'bg-slate-600'"
                    :title="p.checkedInAt ? `Arrivé le ${formatDate(p.checkedInAt)}` : 'Pas encore arrivé'"
                  />
                </div>
              </div>

              <!-- Loading -->
              <TableSkeleton v-if="isLoading && items.length === 0" :rows="5" :columns="4" />
            </div>
          </div>

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
      </div>
    </div>
  </AdminLayout>
</template>
