<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { ArrowLeft, Camera, CameraOff, Search } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { useGetEventDetailStats } from '@/modules/analytics/ui/hooks/queries/query/use-get-event-detail-stats'
import { BraceletStatus } from '@/modules/bracelet/core/model/bracelet.domain-model'
import { InteractionType } from '@/modules/check-in/core/model/check-in.domain-model'
import { useRecordCheckIn } from '@/modules/check-in/ui/hooks/queries/mutation/use-record-check-in'
import { useGetEventById } from '@/modules/event/ui/hooks/queries/query/use-get-event-by-id'
import { useGetPaginatedParticipantsByEvent } from '@/modules/participant/ui/hooks/queries/query/use-get-paginated-participants-by-event'
import QrCodeScanner from '@/modules/qrcode/ui/components/qrcode-scanner.vue'

import ScannerResultOverlay, { type ScannerResult } from './components/scanner-result-overlay.vue'

const route = useRoute()
const queryClient = useQueryClient()

const eventIdRaw = route.params.eventId as string
const eventIdRef = ref<string | null>(eventIdRaw)
const eventIdString = computed(() => eventIdRef.value ?? '')

const { data: event } = useGetEventById(eventIdRef)
const { data: stats } = useGetEventDetailStats(eventIdRef)

const search = ref('')
const searchDebounced = ref('')
const page = ref(1)
const limit = ref(50)
const tabEnabled = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchDebounced.value = value
    page.value = 1
  }, 300)
})

const { data: pagedParticipants } = useGetPaginatedParticipantsByEvent({
  eventId: eventIdRef,
  page,
  limit,
  search: searchDebounced,
  enabled: tabEnabled,
})

const participantItems = computed(() => pagedParticipants.value?.items ?? [])

const INTERACTION_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: InteractionType.CHECK_IN, label: 'Entrée' },
  { value: InteractionType.NETWORKING, label: 'Networking' },
  { value: InteractionType.VOTE, label: 'Vote' },
  { value: InteractionType.CASHLESS, label: 'Paiement' },
]
const interactionType = ref<InteractionType>(InteractionType.CHECK_IN)
const interactionLabel = computed(
  () => INTERACTION_OPTIONS.find((o) => o.value === interactionType.value)?.label ?? interactionType.value
)

const manualInput = ref('')
const manualInputEl = ref<HTMLInputElement | null>(null)

const cameraEnabled = ref(false)
const scannerPaused = ref(false)

const sessionScanned = ref<Set<string>>(new Set())
function sessionKey(nfcId: string, type: InteractionType): string {
  return `${type}::${nfcId}`
}

const sessionSuccessCount = ref(0)

const result = ref<ScannerResult | null>(null)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function showResult(r: ScannerResult): void {
  result.value = r
  scannerPaused.value = true
  if (dismissTimer) clearTimeout(dismissTimer)
  dismissTimer = setTimeout(dismissResult, 2500)
}

function dismissResult(): void {
  result.value = null
  scannerPaused.value = false
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  manualInputEl.value?.focus()
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && result.value) {
    e.preventDefault()
    dismissResult()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  manualInputEl.value?.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (dismissTimer) clearTimeout(dismissTimer)
})

const recordMutation = useRecordCheckIn()

function findParticipantNameByNfcId(nfcId: string): string | null {
  const match = participantItems.value.find((p) => p.bracelet?.nfcId === nfcId)
  return match ? match.profile.displayName : null
}

async function doScan(nfcId: string): Promise<void> {
  const trimmed = nfcId.trim()
  if (!trimmed) return

  try {
    await recordMutation.mutateAsync({
      nfcId: trimmed,
      eventId: eventIdString.value,
      interactionType: interactionType.value,
    })
    sessionScanned.value.add(sessionKey(trimmed, interactionType.value))
    sessionSuccessCount.value += 1
    showResult({
      kind: 'success',
      nfcId: trimmed,
      participantName: findParticipantNameByNfcId(trimmed),
      interactionLabel: interactionLabel.value,
      time: new Date(),
    })
    queryClient.invalidateQueries({ queryKey: ['analytics', 'event', eventIdString.value] })
    queryClient.invalidateQueries({ queryKey: ['checkIns', 'event', eventIdString.value] })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    // Server-side dedup: the backend now rejects a duplicate CHECK_IN with a 409 +
    // "already been checked in" message. We match that to surface the same fullscreen
    // warning we used to do client-side.
    const isDuplicate = /already been checked in|already.*checked|déjà/i.test(message)
    const isNotFound = /not found|introuvable|404/i.test(message)
    const kind = isDuplicate ? 'duplicate' : isNotFound ? 'unknown' : 'error'
    showResult({
      kind,
      nfcId: trimmed,
      participantName: isDuplicate ? findParticipantNameByNfcId(trimmed) : null,
      interactionLabel: interactionLabel.value,
      time: new Date(),
      errorMessage: message,
    })
  }
}

function handleManualSubmit(): void {
  const value = manualInput.value
  manualInput.value = ''
  void doScan(value)
}

function handleScannerDetect(text: string): void {
  void doScan(text)
}

function isScannable(p: (typeof participantItems.value)[number]): boolean {
  if (!p.bracelet) return false
  return p.bracelet.status === BraceletStatus.ACTIVE || p.bracelet.status === BraceletStatus.PRE_ACTIVATED
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[#020617] text-slate-50">
    <header class="flex items-center justify-between border-b border-white/10 bg-[#0F172A] px-6 py-3">
      <RouterLink
        :to="`/admin/events/${eventIdString}`"
        class="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-50"
      >
        <ArrowLeft class="h-4 w-4" />
        Retour à l'événement
      </RouterLink>
      <div class="flex flex-col items-center">
        <h1 class="text-sm font-semibold">{{ event?.name ?? 'Scanner' }}</h1>
        <span class="text-xs text-slate-400">Mode scanner — démo NFC</span>
      </div>
      <div class="flex items-center gap-4 text-right">
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider text-slate-500">Session</span>
          <span class="text-lg font-semibold text-emerald-300">{{ sessionSuccessCount }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wider text-slate-500">Total event</span>
          <span class="text-lg font-semibold text-slate-50">{{ stats?.checkInCount ?? '—' }}</span>
        </div>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#0F172A]/70 px-6 py-3">
      <span class="text-xs uppercase tracking-wider text-slate-500">Type :</span>
      <button
        v-for="opt in INTERACTION_OPTIONS"
        :key="opt.value"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-semibold transition"
        :class="
          interactionType === opt.value
            ? 'border-violet-400 bg-violet-500/20 text-violet-200'
            : 'border-white/10 text-slate-400 hover:text-slate-200'
        "
        @click="interactionType = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <main class="flex flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
      <section class="flex flex-1 flex-col gap-6">
        <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6">
          <label for="scanner-input" class="text-xs uppercase tracking-wider text-slate-500"> Saisie manuelle </label>
          <form class="mt-3 flex items-center gap-2" @submit.prevent="handleManualSubmit">
            <input
              id="scanner-input"
              ref="manualInputEl"
              v-model="manualInput"
              type="text"
              placeholder="Bracelet : demo-nfc-001…"
              autocomplete="off"
              spellcheck="false"
              class="flex-1 rounded-md border border-white/10 bg-[#020617] px-4 py-3 font-mono text-base text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
            />
            <button
              type="submit"
              :disabled="!manualInput.trim() || recordMutation.isPending.value"
              class="rounded-md bg-[#8B5CF6] px-5 py-3 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
            >
              Scanner
            </button>
          </form>
          <p class="mt-2 text-xs text-slate-500">Saisissez ou collez l'ID du bracelet, puis appuyez sur Entrée.</p>
        </div>

        <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider text-slate-500">Caméra (QR code)</span>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5"
              @click="cameraEnabled = !cameraEnabled"
            >
              <component :is="cameraEnabled ? CameraOff : Camera" class="h-3.5 w-3.5" />
              {{ cameraEnabled ? 'Désactiver' : 'Activer la caméra' }}
            </button>
          </div>

          <div v-if="cameraEnabled" class="mt-4">
            <QrCodeScanner :paused="scannerPaused" @scan="handleScannerDetect" />
            <p class="mt-2 text-xs text-slate-500">Pointez la caméra vers le QR code affiché par le participant.</p>
          </div>
          <p v-else class="mt-3 text-xs text-slate-500">
            Activez la caméra pour scanner les QR codes affichés par les participants.
          </p>
        </div>
      </section>

      <aside class="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0F172A] p-4 lg:w-[28rem]">
        <div class="flex items-center gap-2 rounded-md border border-white/10 bg-[#020617] px-3 py-2">
          <Search class="h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher un participant…"
            class="w-full bg-transparent text-sm text-slate-50 outline-none placeholder:text-slate-500"
          />
        </div>

        <div class="flex flex-col gap-2 overflow-y-auto" style="max-height: calc(100vh - 18rem)">
          <div
            v-if="participantItems.length === 0"
            class="rounded-md border border-white/10 bg-[#020617] p-4 text-center text-xs text-slate-500"
          >
            Aucun participant trouvé.
          </div>
          <div
            v-for="p in participantItems"
            :key="p.id"
            class="flex items-center gap-3 rounded-md border border-white/10 bg-[#020617] px-3 py-2"
          >
            <div class="flex flex-col">
              <span class="text-sm font-medium text-slate-50">{{ p.profile.displayName }}</span>
              <span v-if="p.bracelet" class="font-mono text-[11px] text-slate-400">{{ p.bracelet.nfcId }}</span>
              <span v-else class="text-[11px] text-slate-500">Pas de bracelet</span>
            </div>
            <div class="ml-auto">
              <button
                v-if="isScannable(p) && p.bracelet"
                type="button"
                :disabled="recordMutation.isPending.value"
                class="rounded-md border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
                @click="doScan(p.bracelet.nfcId)"
              >
                Simuler le scan
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <ScannerResultOverlay :result="result" @dismiss="dismissResult" />
  </div>
</template>
