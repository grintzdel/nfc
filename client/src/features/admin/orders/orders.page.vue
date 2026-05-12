<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { ShoppingBag, TrendingUp } from 'lucide-vue-next'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import StatCard from '@/ui/components/stat-card.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import { useGetAllOrders } from '@/modules/order/ui/hooks/queries/query/use-get-all-orders'
import { useUpdateOrderStatus } from '@/modules/order/ui/hooks/queries/mutation/use-update-order-status'
import { OrderStatus } from '@/modules/order/core/model/order.domain-model'

const { data: orders, isLoading } = useGetAllOrders()
const updateStatusMutation = useUpdateOrderStatus()

const items = computed(() => orders.value ?? [])

const STATUS_FILTER = [
  { key: 'all', label: 'Toutes' },
  { key: OrderStatus.PENDING, label: 'En attente' },
  { key: OrderStatus.CONFIRMED, label: 'Confirmées' },
  { key: OrderStatus.SHIPPED, label: 'Expédiées' },
  { key: OrderStatus.DELIVERED, label: 'Livrées' },
  { key: OrderStatus.CANCELLED, label: 'Annulées' },
]
const activeFilter = ref<string>('all')

const filteredItems = computed(() =>
  activeFilter.value === 'all' ? items.value : items.value.filter((o) => o.status === activeFilter.value),
)

const STATUS_OPTIONS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.SHIPPED]: 'Expédiée',
  [OrderStatus.DELIVERED]: 'Livrée',
  [OrderStatus.CANCELLED]: 'Annulée',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-slate-500/20 text-slate-300',
  [OrderStatus.CONFIRMED]: 'bg-blue-500/20 text-blue-300',
  [OrderStatus.SHIPPED]: 'bg-violet-500/20 text-violet-300',
  [OrderStatus.DELIVERED]: 'bg-emerald-500/20 text-emerald-300',
  [OrderStatus.CANCELLED]: 'bg-red-500/20 text-red-300',
}

function handleStatusChange(id: string, status: OrderStatus): void {
  updateStatusMutation.mutate(
    { id, status },
    {
      onSuccess: () => toast.success('Statut mis à jour'),
      onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la mise à jour'),
    },
  )
}

const totalRevenue = computed(() =>
  items.value
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + o.totalAmount, 0),
)

const eurFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <AdminLayout title="Commandes" subtitle="Suivi et statut des commandes e-commerce">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <!-- Stats strip -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          :icon="ShoppingBag"
          icon-color="#3B82F6"
          title="Total commandes"
          :value="items.length.toLocaleString('fr-FR')"
          badge="hors annulées comptées en revenus"
          badge-variant="positive"
        />
        <StatCard
          :icon="TrendingUp"
          icon-color="#22C55E"
          title="Revenus cumulés"
          :value="eurFormatter.format(totalRevenue)"
          badge="Toutes commandes confondues sauf annulées"
          badge-variant="positive"
        />
      </div>

      <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
        <!-- Tabs -->
        <div class="flex items-center px-6 pt-4">
          <div class="flex flex-wrap items-center gap-0.5 rounded-md bg-slate-800 p-0.5">
            <button
              v-for="tab in STATUS_FILTER"
              :key="tab.key"
              type="button"
              class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
              :class="
                activeFilter === tab.key
                  ? 'bg-[#0F172A] text-slate-50 border border-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              "
              @click="activeFilter = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div v-if="!isLoading && filteredItems.length === 0" class="flex h-32 items-center justify-center">
          <p class="text-sm text-slate-400">Aucune commande dans cette catégorie.</p>
        </div>

        <template v-else>
          <div class="flex items-center bg-slate-800">
            <div class="w-[180px] px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Date</span></div>
            <div class="flex-1 px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Articles</span></div>
            <div class="w-[140px] px-4 py-3 text-right"><span class="text-xs font-semibold tracking-wide text-slate-400">Montant</span></div>
            <div class="w-[120px] px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Statut</span></div>
            <div class="w-[180px] px-4 py-3"><span class="text-xs font-semibold tracking-wide text-slate-400">Action</span></div>
          </div>

          <div v-for="o in filteredItems" :key="o.id" class="flex items-center border-t border-white/10">
            <div class="w-[180px] px-4 py-3 text-sm text-slate-300">{{ formatDate(o.createdAt) }}</div>
            <div class="flex-1 px-4 py-3 text-sm text-slate-50">
              <span v-for="(it, i) in o.items" :key="i" class="text-sm text-slate-300">
                {{ it.quantity }}× {{ it.productName }}<span v-if="i < o.items.length - 1">, </span>
              </span>
            </div>
            <div class="w-[140px] px-4 py-3 text-right text-sm font-medium text-slate-50">
              {{ eurFormatter.format(o.totalAmount) }}
            </div>
            <div class="w-[120px] px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="STATUS_CLASS[o.status]"
              >
                {{ STATUS_LABEL[o.status] }}
              </span>
            </div>
            <div class="w-[180px] px-4 py-3">
              <Select :model-value="o.status" @update:model-value="(v) => handleStatusChange(o.id, v as OrderStatus)">
                <SelectTrigger class="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in STATUS_OPTIONS" :key="s" :value="s">
                    {{ STATUS_LABEL[s] }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="isLoading && filteredItems.length === 0" class="flex h-32 items-center justify-center">
            <p class="text-sm text-slate-400">Chargement…</p>
          </div>
        </template>
      </div>
    </div>
  </AdminLayout>
</template>
