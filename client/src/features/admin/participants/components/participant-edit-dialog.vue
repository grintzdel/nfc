<script setup lang="ts">
import { ref, watch } from 'vue'

import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{
  open: boolean
  loading?: boolean
  participant: ParticipantDomainModel.MyParticipationDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: { displayName: string; role: string | null; bio: string | null }]
}>()

const displayName = ref('')
const role = ref('')
const bio = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    displayName.value = props.participant?.profile.displayName ?? ''
    role.value = props.participant?.profile.role ?? ''
    bio.value = props.participant?.profile.bio ?? ''
  }
)

function handleConfirm(): void {
  if (!displayName.value.trim()) return
  emit('confirm', {
    displayName: displayName.value.trim(),
    role: role.value.trim() ? role.value.trim() : null,
    bio: bio.value.trim() ? bio.value.trim() : null,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier le participant</DialogTitle>
        <DialogDescription class="text-slate-400">
          Mettez à jour le profil affiché publiquement lors d'un scan du bracelet.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Nom affiché *</label>
          <input
            v-model="displayName"
            type="text"
            placeholder="Jean Dupont"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Rôle</label>
          <input
            v-model="role"
            type="text"
            placeholder="Speaker, VIP, Staff…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Bio</label>
          <textarea
            v-model="bio"
            rows="3"
            placeholder="Quelques mots…"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
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
          :disabled="!displayName.trim() || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          {{ loading ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
