<script setup lang="ts">
import { ref, watch } from 'vue'

import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{
  open: boolean
  loading?: boolean
  order: OrderDomainModel.OrderOverviewDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [payload: { shippingAddress: string }]
}>()

const shippingAddress = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    shippingAddress.value = props.order?.shippingAddress ?? ''
  }
)

function handleConfirm(): void {
  if (!shippingAddress.value.trim()) return
  emit('confirm', { shippingAddress: shippingAddress.value.trim() })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="bg-[#0F172A] text-slate-50 sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Modifier la commande</DialogTitle>
        <DialogDescription class="text-slate-400">
          Seule l'adresse de livraison est éditable. Le statut se change depuis le menu déroulant de la liste.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs uppercase tracking-wider text-slate-400">Adresse de livraison *</label>
          <textarea
            v-model="shippingAddress"
            rows="3"
            placeholder="Rue, code postal, ville…"
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
          :disabled="!shippingAddress.trim() || loading"
          class="rounded-md bg-[#8B5CF6] px-3.5 py-2 text-sm font-semibold text-violet-50 hover:bg-violet-500 disabled:opacity-50"
          @click="handleConfirm"
        >
          Enregistrer
        </button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
