<script setup lang="ts">
import { Package } from 'lucide-vue-next'
import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'
import type { OrderStatus } from '@/modules/order/core/model/order.domain-model'

defineProps<{
  orders: OrderDomainModel.OrderOverviewDto[]
}>()

const statusConfig: Record<OrderStatus, { label: string; class: string }> = {
  pending: { label: 'En attente', class: 'bg-yellow-500/20 text-yellow-400' },
  confirmed: { label: 'Confirmee', class: 'bg-blue-500/20 text-blue-400' },
  shipped: { label: 'Expediee', class: 'bg-violet-500/20 text-violet-400' },
  delivered: { label: 'Livree', class: 'bg-emerald-500/20 text-emerald-400' },
  cancelled: { label: 'Annulee', class: 'bg-red-500/20 text-red-400' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function totalItems(order: OrderDomainModel.OrderOverviewDto): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="order in orders"
      :key="order.id"
      class="rounded-xl border border-slate-700/50 bg-pulse-surface p-5"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/20">
            <Package class="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-50">{{ totalItems(order) }} article{{ totalItems(order) > 1 ? 's' : '' }}</p>
            <p class="text-xs text-slate-400">{{ formatDate(order.createdAt) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusConfig[order.status].class]">
            {{ statusConfig[order.status].label }}
          </span>
          <span class="text-lg font-bold text-slate-50">{{ order.totalAmount.toFixed(2) }}&#8364;</span>
        </div>
      </div>
      <div class="mt-3 border-t border-slate-700/30 pt-3">
        <div v-for="item in order.items" :key="item.productId" class="flex justify-between py-1 text-sm">
          <span class="text-slate-400">{{ item.productName }} x{{ item.quantity }}</span>
          <span class="text-slate-300">{{ (item.unitPrice * item.quantity).toFixed(2) }}&#8364;</span>
        </div>
      </div>
    </div>
  </div>
</template>
