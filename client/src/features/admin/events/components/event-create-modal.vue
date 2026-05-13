<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

type FormPayload = EventDomainModel.CreateEventDto

const props = defineProps<{ open: boolean; loading?: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: FormPayload]
}>()

const name = ref('')
const description = ref('')
const venueName = ref('')
const venueAddress = ref('')
const city = ref('')
const startsAt = ref('')
const endsAt = ref('')
const capacity = ref<number>(100)
const staffCount = ref<number>(0)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    // Default the start to "tomorrow at 18:00" so the date pickers are non-empty.
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    tomorrow.setHours(18, 0, 0, 0)
    const end = new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000)
    name.value = ''
    description.value = ''
    venueName.value = ''
    venueAddress.value = ''
    city.value = ''
    startsAt.value = toLocalInputValue(tomorrow)
    endsAt.value = toLocalInputValue(end)
    capacity.value = 100
    staffCount.value = 0
  }
)

function toLocalInputValue(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const isValid = computed(
  () =>
    name.value.trim().length > 0 &&
    Boolean(startsAt.value) &&
    Boolean(endsAt.value) &&
    new Date(endsAt.value) > new Date(startsAt.value) &&
    capacity.value > 0
)

function handleConfirm(): void {
  if (!isValid.value) return
  emit('confirm', {
    name: name.value.trim(),
    slug: slugify(name.value.trim()),
    description: description.value.trim(),
    venueName: venueName.value.trim(),
    venueAddress: venueAddress.value.trim(),
    city: city.value.trim(),
    startsAt: new Date(startsAt.value).toISOString(),
    endsAt: new Date(endsAt.value).toISOString(),
    capacity: capacity.value,
    staffCount: staffCount.value,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Nouvel événement</DialogTitle>
        <DialogDescription class="text-slate-400">
          L'événement est créé en statut <strong class="text-slate-200">Brouillon</strong>. Vous pourrez le publier
          depuis sa page de détail.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Nom *</label>
          <input
            v-model="name"
            type="text"
            placeholder="Pulse Demo 2026…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            v-model="description"
            rows="2"
            placeholder="Description courte de l'événement…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Nom du lieu</label>
            <input
              v-model="venueName"
              type="text"
              placeholder="Station F"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Ville</label>
            <input
              v-model="city"
              type="text"
              placeholder="Paris"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Adresse</label>
          <input
            v-model="venueAddress"
            type="text"
            placeholder="5 Parvis Alan Turing, Paris"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Début *</label>
            <input
              v-model="startsAt"
              type="datetime-local"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Fin *</label>
            <input
              v-model="endsAt"
              type="datetime-local"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Capacité *</label>
            <input
              v-model.number="capacity"
              type="number"
              min="1"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs uppercase tracking-wider text-slate-400">Staff prévu</label>
            <input
              v-model.number="staffCount"
              type="number"
              min="0"
              class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none focus:border-violet-400"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <button
          type="button"
          class="rounded-md border border-white/10 px-3.5 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5"
          @click="emit('update:open', false)"
        >
          Annuler
        </button>
        <button
          type="button"
          :disabled="!isValid || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          Créer
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
