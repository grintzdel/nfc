<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

const props = defineProps<{
  participant: ParticipantDomainModel.ParticipantOverviewDto | null
  availableBracelets: BraceletDomainModel.BraceletOverviewDto[]
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: { participantId: string; braceletId: string }]
}>()

const selectedBraceletId = ref<string>('')

watch(
  () => props.open,
  (open) => {
    if (open) selectedBraceletId.value = ''
  },
)

function handleConfirm(): void {
  if (!props.participant || !selectedBraceletId.value) return
  emit('confirm', { participantId: props.participant.id, braceletId: selectedBraceletId.value })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Attacher un bracelet</DialogTitle>
        <DialogDescription class="text-slate-400">
          <template v-if="participant">
            Sélectionnez un bracelet à attacher à <strong class="text-slate-200">{{ participant.profile.displayName }}</strong>.
          </template>
        </DialogDescription>
      </DialogHeader>

      <div v-if="availableBracelets.length === 0" class="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
        Aucun bracelet disponible. Créez-en depuis Bracelets &gt; Stock.
      </div>

      <div v-else class="flex flex-col gap-2">
        <label for="bracelet-select" class="text-sm text-slate-300">Bracelet</label>
        <Select id="bracelet-select" :model-value="selectedBraceletId" @update:model-value="(v) => selectedBraceletId = String(v)">
          <SelectTrigger>
            <SelectValue placeholder="Choisir un bracelet…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="b in availableBracelets" :key="b.id" :value="b.id">
              {{ b.nfcId }}
            </SelectItem>
          </SelectContent>
        </Select>
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
          :disabled="!selectedBraceletId || loading || availableBracelets.length === 0"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          Attacher
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
