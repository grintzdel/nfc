<script setup lang="ts">
import { ref, watch } from 'vue'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{ open: boolean; loading?: boolean }>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: { nfcId: string; productId?: string }]
}>()

const nfcId = ref('')
const productId = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) {
      nfcId.value = ''
      productId.value = ''
    }
  }
)

function handleConfirm(): void {
  if (!nfcId.value.trim()) return
  emit('confirm', {
    nfcId: nfcId.value.trim(),
    productId: productId.value.trim() || undefined,
  })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Créer un bracelet</DialogTitle>
        <DialogDescription class="text-slate-400">
          Le bracelet sera créé en statut <strong class="text-slate-200">Stock</strong>. Vous pourrez l'assigner à un
          événement depuis la page de l'événement.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label for="nfc-id" class="text-xs uppercase tracking-wider text-slate-400">NFC ID *</label>
          <input
            id="nfc-id"
            v-model="nfcId"
            type="text"
            placeholder="nfc-001 ou laissez vide pour auto-générer"
            autocomplete="off"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 font-mono text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="product-id" class="text-xs uppercase tracking-wider text-slate-400">Product ID (optionnel)</label>
          <input
            id="product-id"
            v-model="productId"
            type="text"
            placeholder="ID du produit lié (optionnel)"
            autocomplete="off"
            class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 font-mono text-sm text-slate-50 outline-none placeholder:text-slate-500 focus:border-violet-400"
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
          :disabled="!nfcId.trim() || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          Créer
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
