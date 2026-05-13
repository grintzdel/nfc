<script setup lang="ts">
import { ShoppingCart } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import { useCart } from '@/modules/cart/ui/hooks/use-cart'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'

const props = defineProps<{
  product: ProductDomainModel.ProductOverviewDto
}>()

const { addItem } = useCart()

function handleAddToCart() {
  addItem(props.product.id, 1)
  toast.success('Article ajoute au panier')
}
</script>

<template>
  <RouterLink
    :to="`/product/${product.slug}`"
    class="group flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-b from-pulse-surface to-pulse-bg shadow-[0_8px_30px_rgba(124,58,237,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_16px_40px_rgba(124,58,237,0.25)]"
  >
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-pulse-surface to-pulse-bg">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="flex h-full items-center justify-center">
        <span class="text-5xl">🎫</span>
      </div>

      <div
        v-if="product.featured"
        class="absolute left-3 top-3 rounded-full bg-violet-600/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Populaire
      </div>

      <div
        v-if="product.stock <= 5 && product.stock > 0"
        class="absolute right-3 top-3 rounded-full bg-orange-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Plus que {{ product.stock }}
      </div>
      <div
        v-else-if="product.stock === 0"
        class="absolute right-3 top-3 rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
      >
        Rupture
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <h3 class="text-lg font-semibold text-slate-50 transition-colors group-hover:text-violet-300">
        {{ product.name }}
      </h3>

      <p class="line-clamp-2 text-sm leading-relaxed text-slate-400">
        {{ product.description }}
      </p>

      <div class="mt-auto flex items-center justify-between pt-2">
        <span class="text-2xl font-extrabold text-violet-400"> {{ product.price.toFixed(2) }}€ </span>

        <button
          class="flex items-center gap-2 rounded-lg bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/30 disabled:opacity-40"
          :disabled="product.stock === 0"
          @click.prevent="handleAddToCart"
        >
          <ShoppingCart class="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </div>
  </RouterLink>
</template>
