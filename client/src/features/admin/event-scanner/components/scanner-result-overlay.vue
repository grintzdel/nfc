<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-vue-next'

export type ScannerResultKind = 'success' | 'unknown' | 'duplicate' | 'error'

export type ScannerResult = {
  kind: ScannerResultKind
  nfcId: string
  participantName: string | null
  interactionLabel: string
  time: Date
  errorMessage?: string
}

const props = defineProps<{ result: ScannerResult | null }>()
const emit = defineEmits<{ dismiss: [] }>()

const variant = computed(() => {
  if (!props.result) return null
  return {
    success: { icon: CheckCircle2, color: 'emerald', label: 'ENTRÉE AUTORISÉE' },
    unknown: { icon: XCircle, color: 'red', label: 'BRACELET INCONNU' },
    duplicate: { icon: AlertTriangle, color: 'amber', label: 'DÉJÀ ENREGISTRÉ' },
    error: { icon: XCircle, color: 'red', label: 'ERREUR' },
  }[props.result.kind]
})

const formattedTime = computed(() => {
  if (!props.result) return ''
  return props.result.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
})

function initialsOf(name: string | null): string {
  if (!name) return '—'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

const colorClasses = computed(() => {
  if (!variant.value) return {}
  return {
    emerald: {
      ring: 'ring-emerald-500/40',
      bg: 'from-emerald-500/20 to-emerald-500/5',
      icon: 'text-emerald-400',
      label: 'text-emerald-300',
      avatar: 'from-emerald-500 to-teal-400',
    },
    red: {
      ring: 'ring-red-500/40',
      bg: 'from-red-500/20 to-red-500/5',
      icon: 'text-red-400',
      label: 'text-red-300',
      avatar: 'from-red-500 to-rose-400',
    },
    amber: {
      ring: 'ring-amber-500/40',
      bg: 'from-amber-500/20 to-amber-500/5',
      icon: 'text-amber-400',
      label: 'text-amber-300',
      avatar: 'from-amber-500 to-orange-400',
    },
  }[variant.value.color]!
})
</script>

<template>
  <div
    v-if="result && variant"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    @click="emit('dismiss')"
  >
    <div
      class="flex max-w-md flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[#0F172A] p-10 text-center shadow-2xl ring-4"
      :class="[`bg-gradient-to-b ${colorClasses.bg}`, colorClasses.ring]"
    >
      <component :is="variant.icon" class="h-20 w-20" :class="colorClasses.icon" />

      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold uppercase tracking-widest" :class="colorClasses.label">
          {{ variant.label }}
        </span>
        <span class="text-xs text-slate-500">{{ formattedTime }} — {{ result.interactionLabel }}</span>
      </div>

      <div v-if="result.participantName" class="flex flex-col items-center gap-3">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white"
          :class="`bg-gradient-to-br ${colorClasses.avatar}`"
        >
          {{ initialsOf(result.participantName) }}
        </div>
        <h2 class="text-2xl font-bold text-slate-50">{{ result.participantName }}</h2>
      </div>

      <div v-if="!result.participantName" class="flex flex-col gap-1">
        <span class="font-mono text-sm text-slate-300">{{ result.nfcId }}</span>
        <span v-if="result.errorMessage" class="text-xs text-slate-400">{{ result.errorMessage }}</span>
      </div>

      <button type="button" class="text-xs text-slate-500 hover:text-slate-300" @click.stop="emit('dismiss')">
        Cliquer ou appuyer sur Échap pour fermer
      </button>
    </div>
  </div>
</template>
