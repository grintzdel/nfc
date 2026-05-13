<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { ref, watch } from 'vue'

import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

const props = defineProps<{
  event: EventDomainModel.EventOverviewDto | null
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [dto: EventDomainModel.UpdateEventDto]
}>()

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
