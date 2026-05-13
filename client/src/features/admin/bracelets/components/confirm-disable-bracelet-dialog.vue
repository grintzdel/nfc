<script setup lang="ts">
import { PowerOff } from 'lucide-vue-next'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

defineProps<{
  open: boolean
  nfcId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <div class="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15">
          <PowerOff class="h-5 w-5 text-orange-400" />
        </div>
        <DialogTitle>Désactiver le bracelet</DialogTitle>
        <DialogDescription class="text-slate-400">
          <template v-if="nfcId">
            Le bracelet <strong class="font-mono text-slate-200">{{ nfcId }}</strong> ne pourra plus être scanné. Cette
            action est réversible en réactivant le bracelet plus tard.
          </template>
          <template v-else> Le bracelet ne pourra plus être scanné jusqu'à sa réactivation. </template>
        </DialogDescription>
      </DialogHeader>

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
          :disabled="loading"
          class="rounded-md bg-orange-500 px-3.5 py-2 text-sm font-semibold text-orange-50 hover:bg-orange-600 disabled:opacity-50"
          @click="emit('confirm')"
        >
          {{ loading ? 'Désactivation...' : 'Désactiver' }}
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
