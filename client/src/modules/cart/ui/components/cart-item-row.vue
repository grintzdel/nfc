<script setup lang="ts">
import { Trash2, Minus, Plus } from 'lucide-vue-next'

import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'

const props = defineProps<{
  item: CartDomainModel.CartItemOverviewDto
  product: ProductDomainModel.ProductOverviewDto | undefined
}>()

const emit = defineEmits<{
  updateQuantity: [id: string, quantity: number]
  remove: [id: string]
}>()

function decrement() {
  if (props.item.quantity > 1) {
    emit('updateQuantity', props.item.id, props.item.quantity - 1)
  }
}

function increment() {
  emit('updateQuantity', props.item.id, props.item.quantity + 1)
}
</script>

<template>
  <div class="flex gap-3.5 border-b border-slate-700/50 py-4">
    <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[10px] bg-pulse-surface">
      <img v-if="product?.imageUrl" :src="product.imageUrl" :alt="product?.name" class="h-full w-full object-cover" />
    </div>
    <div class="flex flex-1 flex-col gap-1">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-50">{{ product?.name ?? 'Produit' }}</span>
        <button class="text-slate-400 transition-colors hover:text-slate-200" @click="emit('remove', item.id)">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
      <span class="text-xs text-slate-400">{{ product?.description ?? '' }}</span>
      <div class="mt-auto flex items-center justify-between">
        <span class="text-base font-bold text-violet-400"
          >{{ product ? (product.price * item.quantity).toFixed(2) : '0' }}&#8364;</span
        >
        <div class="flex items-center rounded-md border border-slate-700/50 bg-pulse-surface">
          <button
            class="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-slate-200"
            @click="decrement"
          >
            <Minus class="h-3.5 w-3.5" />
          </button>
          <span class="flex h-8 w-8 items-center justify-center text-sm font-semibold text-slate-50">{{
            item.quantity
          }}</span>
          <button
            class="flex h-8 w-8 items-center justify-center text-slate-50 transition-colors hover:text-white"
            @click="increment"
          >
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
