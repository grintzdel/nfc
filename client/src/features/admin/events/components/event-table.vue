<script setup lang="ts">
import { Search, SlidersHorizontal, Download, Plus, Eye, Pencil, MoreHorizontal } from 'lucide-vue-next'
import { Pagination } from '@/ui/pagination'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import { EventStatus } from '@/modules/event/core/model/event.domain-model'

const props = defineProps<{
  data?: EventDomainModel.PaginatedEventsDto
  currentStatus: string
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:status': [value: string]
  'update:page': [value: number]
  view: [id: string]
  edit: [id: string]
  delete: [id: string]
  create: []
}>()

const tabs = [
  { key: '', label: 'Tous' },
  { key: EventStatus.UPCOMING, label: 'A venir' },
  { key: EventStatus.IN_PROGRESS, label: 'En cours' },
  { key: EventStatus.COMPLETED, label: 'Termines' },
  { key: EventStatus.DRAFT, label: 'Brouillons' },
]

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Brouillon',
    upcoming: 'A venir',
    in_progress: 'En cours',
    completed: 'Termine',
    cancelled: 'Annule',
  }
  return map[status] ?? status
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-slate-500/20 text-slate-400',
    upcoming: 'bg-orange-500/20 text-orange-400',
    in_progress: 'bg-[#7C3AED] text-white',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }
  return map[status] ?? 'bg-slate-500/20 text-slate-400'
}

</script>

<template>
  <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
    <!-- Tabs -->
    <div class="flex items-center px-6 pt-4">
      <div class="flex items-center gap-0.5 rounded-md bg-slate-800 p-0.5">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
          :class="
            currentStatus === tab.key
              ? 'bg-[#0F172A] text-slate-50 border border-white/10'
              : 'text-slate-400 hover:text-slate-200'
          "
          @click="emit('update:status', tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Search bar -->
    <div class="flex items-center gap-3 px-6 py-4">
      <div class="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-[#0F172A] px-3 py-2">
        <Search class="h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          :value="search"
          placeholder="Rechercher par nom, lieu, organisateur..."
          class="w-full bg-transparent text-[13px] text-slate-50 placeholder:text-slate-400 outline-none"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <button
        type="button"
        disabled
        title="Filtres avancés bientôt disponibles"
        class="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-white/10 bg-slate-800/40 px-3 py-2 opacity-60"
      >
        <SlidersHorizontal class="h-3.5 w-3.5 text-slate-500" />
        <span class="text-[13px] font-medium text-slate-500">Filtres</span>
        <span class="ml-1 rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Soon
        </span>
      </button>
      <button
        type="button"
        disabled
        title="Export CSV bientôt disponible"
        class="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-white/10 bg-slate-800/40 px-3 py-2 opacity-60"
      >
        <Download class="h-3.5 w-3.5 text-slate-500" />
        <span class="text-[13px] font-medium text-slate-500">Export</span>
        <span class="ml-1 rounded-full bg-slate-700 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Soon
        </span>
      </button>
      <button
        type="button"
        class="flex items-center gap-1.5 rounded-md bg-[#8B5CF6] px-4 py-2 hover:bg-violet-500"
        @click="emit('create')"
      >
        <Plus class="h-3.5 w-3.5 text-violet-50" />
        <span class="text-[13px] font-semibold text-violet-50">Nouvel évènement</span>
      </button>
    </div>

    <!-- Table -->
    <div class="w-full overflow-x-auto">
      <!-- Header -->
      <div class="flex items-center bg-slate-800">
        <div class="flex-1 px-4 py-3">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Evenement</span>
        </div>
        <div class="w-[140px] px-4 py-3">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Date</span>
        </div>
        <div class="w-[120px] px-4 py-3 text-right">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Bracelets</span>
        </div>
        <div class="w-[160px] px-4 py-3 text-right">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Check-ins</span>
        </div>
        <div class="w-[130px] px-4 py-3">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Statut</span>
        </div>
        <div class="w-[140px] px-4 py-3 text-right">
          <span class="text-xs font-semibold tracking-wide text-slate-400">Actions</span>
        </div>
      </div>

      <!-- Rows -->
      <div
        v-for="row in data?.items"
        :key="row.id"
        class="flex items-center border-t border-white/10"
      >
        <div class="flex flex-1 flex-col gap-0.5 px-4 py-3">
          <span class="text-sm font-semibold text-slate-50">{{ row.name }}</span>
          <span class="text-xs text-slate-400">{{ row.venueName || row.city }}</span>
        </div>
        <div class="w-[140px] px-4 py-3">
          <span class="text-sm text-slate-50">{{ formatDate(row.startsAt) }}</span>
        </div>
        <div class="w-[120px] px-4 py-3 text-right">
          <span class="text-sm font-medium text-slate-50">{{ row.braceletsCount.toLocaleString('fr-FR') }}</span>
        </div>
        <div class="w-[160px] px-4 py-3 text-right">
          <span class="text-sm text-slate-50">
            {{ row.checkInsCount.toLocaleString('fr-FR') }}
            <span v-if="row.braceletsCount > 0" class="text-slate-400">({{ row.checkInsRate }}%)</span>
          </span>
        </div>
        <div class="w-[130px] px-4 py-3">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="statusClass(row.status)"
          >
            {{ statusLabel(row.status) }}
          </span>
        </div>
        <div class="flex w-[140px] items-center justify-end gap-0.5 px-3 py-3">
          <button
            class="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
            @click="emit('view', row.id)"
          >
            <Eye class="h-4 w-4" />
          </button>
          <button
            class="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
            @click="emit('edit', row.id)"
          >
            <Pencil class="h-4 w-4" />
          </button>
          <button
            class="rounded-md p-2 text-slate-400 hover:bg-white/5 hover:text-red-400"
            @click="emit('delete', row.id)"
          >
            <MoreHorizontal class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="data && data.items.length === 0" class="flex h-40 items-center justify-center">
        <p class="text-sm text-slate-400">Aucun evenement trouve</p>
      </div>
    </div>

    <!-- Footer / Pagination -->
    <Pagination
      v-if="data"
      :page="data.page"
      :total-pages="data.totalPages"
      :total="data.total"
      :limit="data.limit"
      item-label="evenements"
      @update:page="(p) => emit('update:page', p)"
    />
  </div>
</template>
