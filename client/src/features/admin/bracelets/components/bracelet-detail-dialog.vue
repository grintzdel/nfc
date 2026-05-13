<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { BraceletStatus, type BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{
  open: boolean
  bracelet: BraceletDomainModel.BraceletOverviewDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

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

function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(dateStr))
}

const publicUrl = computed(() => {
  if (!props.bracelet || props.bracelet.status !== BraceletStatus.ACTIVE) return null
  return `/p/${props.bracelet.nfcId}`
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent v-if="bracelet" class="bg-[#0F172A] text-slate-50 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Détail du bracelet</DialogTitle>
        <DialogDescription class="font-mono text-xs text-slate-400">{{ bracelet.id }}</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between rounded-md border border-white/10 bg-[#020617] px-3 py-2.5">
          <div class="flex flex-col">
            <span class="text-xs uppercase tracking-wider text-slate-400">NFC ID</span>
            <span class="font-mono text-sm text-slate-50">{{ bracelet.nfcId }}</span>
          </div>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
            :class="STATUS_CLASS[bracelet.status]"
          >
            {{ STATUS_LABEL[bracelet.status] ?? bracelet.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Créé le</span>
            <span class="text-slate-200">{{ formatFullDate(bracelet.createdAt) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Activé le</span>
            <span class="text-slate-200">{{ formatFullDate(bracelet.activatedAt) }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Événement</span>
          <RouterLink
            v-if="bracelet.eventId"
            :to="`/admin/events/${bracelet.eventId}`"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-violet-300 hover:text-violet-200"
          >
            Voir l'événement lié
          </RouterLink>
          <div v-else class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-500">
            Non assigné
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="flex flex-col gap-0.5">
            <span class="uppercase tracking-wider text-slate-400">User ID</span>
            <span class="font-mono text-slate-300">{{ bracelet.userId ?? '—' }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="uppercase tracking-wider text-slate-400">Order ID</span>
            <span class="font-mono text-slate-300">{{ bracelet.orderId ?? '—' }}</span>
          </div>
        </div>

        <a
          v-if="publicUrl"
          :href="publicUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
        >
          Ouvrir la page publique
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </DialogContent>
  </Dialog>
</template>
