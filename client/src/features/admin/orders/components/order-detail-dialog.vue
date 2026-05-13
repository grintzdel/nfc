<script setup lang="ts">
import { computed } from 'vue'

import type { OrderDomainModel, OrderStatus } from '@/modules/order/core/model/order.domain-model'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog'

const props = defineProps<{
  open: boolean
  order: OrderDomainModel.OrderOverviewDto | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-slate-500/20 text-slate-300',
  confirmed: 'bg-blue-500/20 text-blue-300',
  shipped: 'bg-violet-500/20 text-violet-300',
  delivered: 'bg-emerald-500/20 text-emerald-300',
  cancelled: 'bg-red-500/20 text-red-300',
}

const formattedCreated = computed(() => {
  if (!props.order) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(props.order.createdAt)
  )
})

const formattedUpdated = computed(() => {
  if (!props.order) return ''
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(props.order.updatedAt)
  )
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent v-if="order" class="bg-[#0F172A] text-slate-50 sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Détail de la commande</DialogTitle>
        <DialogDescription class="font-mono text-xs text-slate-400">{{ order.id }}</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Statut</span>
            <span
              class="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="STATUS_CLASS[order.status]"
            >
              {{ STATUS_LABEL[order.status] }}
            </span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Montant total</span>
            <span class="font-medium text-slate-50">{{ eurFormatter.format(order.totalAmount) }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Créée le</span>
            <span class="text-slate-200">{{ formattedCreated }}</span>
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs uppercase tracking-wider text-slate-400">Dernière màj</span>
            <span class="text-slate-200">{{ formattedUpdated }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Adresse de livraison</span>
          <p class="rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-sm text-slate-200">
            {{ order.shippingAddress }}
          </p>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xs uppercase tracking-wider text-slate-400">Articles ({{ order.items.length }})</span>
          <div class="flex flex-col gap-1.5 rounded-md border border-white/10 bg-[#020617] p-2">
            <div
              v-for="(it, i) in order.items"
              :key="i"
              class="flex items-center justify-between rounded px-2 py-1 text-sm"
            >
              <span class="text-slate-200">{{ it.quantity }}× {{ it.productName }}</span>
              <span class="text-slate-400">{{ eurFormatter.format(it.unitPrice * it.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
