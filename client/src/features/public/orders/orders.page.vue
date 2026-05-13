<script setup lang="ts">
import { Loader2, ShoppingBag } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

import OrderList from '@/modules/order/ui/components/order-list.vue'
import { useGetMyOrders } from '@/modules/order/ui/hooks/queries/query/use-get-my-orders'
import { EmptyState } from '@/ui/empty-state'

const { data: orders, isLoading, isError } = useGetMyOrders()
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-16 lg:px-20">
    <h1 class="mb-8 text-3xl font-extrabold text-slate-50">Mes commandes</h1>

    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <Loader2 class="h-8 w-8 animate-spin text-violet-400" />
    </div>

    <div v-else-if="isError" class="flex flex-col items-center justify-center gap-4 py-20">
      <p class="text-sm text-red-400">Erreur lors du chargement des commandes</p>
    </div>

    <EmptyState
      v-else-if="!orders?.length"
      :icon="ShoppingBag"
      title="Aucune commande pour le moment"
      description="Découvrez notre catalogue de pass NFC et passez votre première commande."
      size="md"
    >
      <RouterLink
        to="/shop"
        class="rounded-md bg-pulse-violet px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-pulse-violet-dark"
      >
        Découvrir le catalogue
      </RouterLink>
    </EmptyState>

    <OrderList v-else :orders="orders" />
  </section>
</template>
