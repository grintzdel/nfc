<script setup lang="ts">
import { CheckCircle2, Play, Send, X, XCircle } from 'lucide-vue-next'
import type { Component } from 'vue'
import { computed, ref, watch } from 'vue'

import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import { EventStatus } from '@/modules/event/core/model/event.domain-model'
import type { EventStatusAction } from '@/modules/event/ui/hooks/queries/mutation/use-event-status-transition'

const props = defineProps<{
  event: EventDomainModel.EventOverviewDto | null
  open: boolean
  loading?: boolean
  statusLoading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [dto: EventDomainModel.UpdateEventDto]
  'status-action': [action: EventStatusAction]
}>()

type ActionDescriptor = { action: EventStatusAction; label: string; icon: Component; variant: 'primary' | 'danger' }

const STATUS_ACTIONS: Record<EventStatus, ActionDescriptor[]> = {
  [EventStatus.DRAFT]: [{ action: 'publish', label: 'Publier', icon: Send, variant: 'primary' }],
  [EventStatus.UPCOMING]: [
    { action: 'start', label: 'Démarrer', icon: Play, variant: 'primary' },
    { action: 'cancel', label: 'Annuler', icon: XCircle, variant: 'danger' },
  ],
  [EventStatus.IN_PROGRESS]: [{ action: 'complete', label: 'Clôturer', icon: CheckCircle2, variant: 'primary' }],
  [EventStatus.COMPLETED]: [],
  [EventStatus.CANCELLED]: [],
}

const STATUS_LABEL: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'Brouillon',
  [EventStatus.UPCOMING]: 'À venir',
  [EventStatus.IN_PROGRESS]: 'En cours',
  [EventStatus.COMPLETED]: 'Terminé',
  [EventStatus.CANCELLED]: 'Annulé',
}

const STATUS_CLASS: Record<EventStatus, string> = {
  [EventStatus.DRAFT]: 'bg-slate-500/20 text-slate-400',
  [EventStatus.UPCOMING]: 'bg-orange-500/20 text-orange-400',
  [EventStatus.IN_PROGRESS]: 'bg-[#7C3AED] text-white',
  [EventStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-400',
  [EventStatus.CANCELLED]: 'bg-red-500/20 text-red-400',
}

const statusActions = computed(() => (props.event ? STATUS_ACTIONS[props.event.status] : []))

const form = ref({
  name: '',
  description: '',
  venueName: '',
  venueAddress: '',
  city: '',
  startsAt: '',
  endsAt: '',
  capacity: 0,
  staffCount: 0,
})

watch(
  () => props.event,
  (e) => {
    if (e) {
      form.value = {
        name: e.name,
        description: e.description,
        venueName: e.venueName,
        venueAddress: e.venueAddress,
        city: e.city,
        startsAt: e.startsAt.slice(0, 16),
        endsAt: e.endsAt.slice(0, 16),
        capacity: e.capacity,
        staffCount: e.staffCount,
      }
    }
  },
  { immediate: true }
)

function handleSave() {
  emit('save', { ...form.value })
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
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 class="text-lg font-bold text-slate-50">Modifier l'evenement</h2>
          <button class="rounded-md p-1.5 text-slate-400 hover:bg-white/5" @click="emit('close')">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex flex-col gap-3 border-b border-white/10 px-6 py-4">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Statut</span>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="STATUS_CLASS[event.status]"
            >
              {{ STATUS_LABEL[event.status] }}
            </span>
          </div>
          <div v-if="statusActions.length > 0" class="flex flex-wrap items-center gap-2">
            <button
              v-for="a in statusActions"
              :key="a.action"
              type="button"
              :disabled="statusLoading"
              class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold disabled:opacity-50"
              :class="
                a.variant === 'primary'
                  ? 'bg-[#8B5CF6] text-violet-50 hover:bg-violet-500'
                  : 'border border-red-500/40 text-red-300 hover:bg-red-500/10'
              "
              @click="emit('status-action', a.action)"
            >
              <component :is="a.icon" class="h-3.5 w-3.5" />
              {{ a.label }}
            </button>
          </div>
          <p v-else class="text-xs text-slate-500">Aucune transition disponible pour ce statut.</p>
        </div>

        <form class="flex flex-col gap-4 px-6 py-5" @submit.prevent="handleSave">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-400">Nom</label>
            <input
              v-model="form.name"
              type="text"
              class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-400">Description</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Lieu (venue)</label>
              <input
                v-model="form.venueName"
                type="text"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Ville</label>
              <input
                v-model="form.city"
                type="text"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-medium text-slate-400">Adresse</label>
            <input
              v-model="form.venueAddress"
              type="text"
              class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Debut</label>
              <input
                v-model="form.startsAt"
                type="datetime-local"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Fin</label>
              <input
                v-model="form.endsAt"
                type="datetime-local"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Capacite</label>
              <input
                v-model.number="form.capacity"
                type="number"
                min="0"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-medium text-slate-400">Effectif staff</label>
              <input
                v-model.number="form.staffCount"
                type="number"
                min="0"
                class="rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-[#7C3AED]"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              class="rounded-md border border-white/10 px-4 py-2 text-[13px] font-medium text-slate-50 hover:bg-white/5"
              @click="emit('close')"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="rounded-md bg-[#7C3AED] px-4 py-2 text-[13px] font-semibold text-violet-50 hover:bg-[#5B21B6] disabled:opacity-50"
              :disabled="loading"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
