<script setup lang="ts">
import { CheckCircle2, ExternalLink } from 'lucide-vue-next'
import { computed } from 'vue'

import { useGetBraceletById } from '@/modules/bracelet/ui/hooks/queries/query/use-get-bracelet-by-id'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import QrCodeDisplay from '@/modules/qrcode/ui/components/qrcode-display.vue'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{
  open: boolean
  participant: ParticipantDomainModel.MyParticipationDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const formattedRegistered = computed(() => {
  if (!props.participant) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(props.participant.registeredAt)
  )
})

const formattedCheckedIn = computed(() => {
  if (!props.participant?.checkedInAt) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(props.participant.checkedInAt)
  )
})

const braceletId = computed(() => (props.open ? (props.participant?.braceletId ?? '') : ''))
const { data: bracelet, isLoading: braceletLoading } = useGetBraceletById(braceletId)

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent v-if="participant" class="bg-[#0F172A] text-slate-50 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Détail du participant</DialogTitle>
        <DialogDescription class="font-mono text-xs text-slate-400">{{ participant.id }}</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3 rounded-md border border-white/10 bg-[#020617] px-3 py-2.5">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-sm font-semibold text-white"
          >
            {{ initials(participant.profile.displayName) }}
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-medium text-slate-50">{{ participant.profile.displayName }}</span>
            <span v-if="participant.profile.role" class="text-xs text-slate-400">{{ participant.profile.role }}</span>
          </div>
        </div>

        <div v-if="participant.profile.bio" class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Bio</span>
          <p class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-200">
            {{ participant.profile.bio }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Inscrit le</span>
            <span class="text-slate-200">{{ formattedRegistered }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Check-in</span>
            <span v-if="participant.checkedInAt" class="inline-flex items-center gap-1 text-emerald-300">
              <CheckCircle2 class="h-3.5 w-3.5" />
              {{ formattedCheckedIn }}
            </span>
            <span v-else class="text-slate-500">Pas encore arrivé</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Événement</span>
          <div v-if="participant.event" class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm">
            <div class="font-medium text-slate-50">{{ participant.event.name }}</div>
            <div class="text-xs text-slate-400">{{ participant.event.venueName }} — {{ participant.event.city }}</div>
          </div>
          <div v-else class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-500">
            Événement supprimé
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Bracelet</span>
          <div
            v-if="!participant.braceletId"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-500"
          >
            Aucun bracelet rattaché
          </div>
          <div
            v-else-if="braceletLoading"
            class="flex h-32 items-center justify-center rounded-md border border-white/10 bg-[#020617] text-xs text-slate-500"
          >
            Chargement du bracelet…
          </div>
          <div v-else-if="bracelet" class="flex items-center gap-3 rounded-md border border-white/10 bg-[#020617] p-3">
            <QrCodeDisplay :value="bracelet.nfcId" :size="120" :alt="`QR code du bracelet ${bracelet.nfcId}`" />
            <div class="flex flex-col gap-1 text-xs">
              <span class="uppercase tracking-wider text-slate-400">NFC ID</span>
              <span class="font-mono text-slate-200">{{ bracelet.nfcId }}</span>
              <span class="mt-2 uppercase tracking-wider text-slate-400">Statut</span>
              <span class="text-slate-200">{{ bracelet.status }}</span>
            </div>
          </div>
        </div>

        <div v-if="participant.profile.links.length > 0" class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">
            Liens ({{ participant.profile.links.length }})
          </span>
          <div class="flex flex-col gap-1 rounded-md border border-white/10 bg-[#020617] p-2">
            <a
              v-for="(link, i) in participant.profile.links"
              :key="i"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs text-violet-300 hover:bg-white/5 hover:text-violet-200"
            >
              <span class="truncate">{{ link.label || link.type }}</span>
              <ExternalLink class="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
