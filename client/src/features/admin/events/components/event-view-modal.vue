<script setup lang="ts">
import { X, MapPin, Calendar, Users, Watch, Activity } from 'lucide-vue-next'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

defineProps<{
  event: EventDomainModel.EventOverviewDto | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  <Teleport to="body">
    <div
      v-if="open && event"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-lg rounded-lg border border-white/10 bg-[#0F172A] shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-bold text-slate-50">{{ event.name }}</h2>
            <span
              class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="statusClass(event.status)"
            >
              {{ statusLabel(event.status) }}
            </span>
          </div>
          <button class="rounded-md p-1.5 text-slate-400 hover:bg-white/5" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex flex-col gap-4 px-6 py-5">
          <p v-if="event.description" class="text-sm text-slate-300">{{ event.description }}</p>

          <div class="flex flex-col gap-3 rounded-md bg-slate-800 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <MapPin class="h-3.5 w-3.5 text-[#A78BFA]" />
                <span class="text-xs text-slate-400">Lieu</span>
              </div>
              <span class="text-xs font-semibold text-slate-50">{{ event.city || event.venueName || 'A definir' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Calendar class="h-3.5 w-3.5 text-[#A78BFA]" />
                <span class="text-xs text-slate-400">Debut</span>
              </div>
              <span class="text-xs font-semibold text-slate-50">{{ formatDateTime(event.startsAt) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Calendar class="h-3.5 w-3.5 text-[#A78BFA]" />
                <span class="text-xs text-slate-400">Fin</span>
              </div>
              <span class="text-xs font-semibold text-slate-50">{{ formatDateTime(event.endsAt) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Users class="h-3.5 w-3.5 text-[#A78BFA]" />
                <span class="text-xs text-slate-400">Capacite</span>
              </div>
              <span class="text-xs font-semibold text-slate-50">{{ event.capacity.toLocaleString('fr-FR') }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Activity class="h-3.5 w-3.5 text-[#A78BFA]" />
                <span class="text-xs text-slate-400">Staff</span>
              </div>
              <span class="text-xs font-semibold text-slate-50">{{ event.staffCount }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-md bg-slate-800 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Venue</span>
              <span class="text-xs font-semibold text-slate-50">{{ event.venueName || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Adresse</span>
              <span class="text-xs font-semibold text-slate-50">{{ event.venueAddress || '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">Cree le</span>
              <span class="text-xs font-semibold text-slate-50">{{ formatDate(event.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end border-t border-white/10 px-6 py-4">
          <button
            class="rounded-md border border-white/10 px-4 py-2 text-[13px] font-medium text-slate-50 hover:bg-white/5"
            @click="emit('close')"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
