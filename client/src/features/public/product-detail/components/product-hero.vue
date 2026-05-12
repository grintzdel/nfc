<script setup lang="ts">
import { ref } from 'vue'
import { Check, ShieldCheck, Truck, RefreshCcw, Minus, Plus, ShoppingCart } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'
import { useCart } from '@/modules/cart/ui/hooks/use-cart'

const props = defineProps<{
  product: ProductDomainModel.ProductOverviewDto
}>()

const { addItem, openCart: openCartDrawer } = useCart()

const quantity = ref(1)

const features = [
  'Compatible tous portiques NFC',
  'Personnalisation logo incluse',
  'Dashboard organisateur offert',
  'Livraison en 5 jours ouvrables',
  'Support technique inclus',
]

const trustItems = [
  { icon: ShieldCheck, label: 'Paiement securise' },
  { icon: Truck, label: 'Livraison rapide' },
  { icon: RefreshCcw, label: 'Retour 30 jours' },
]

function decrement() {
  if (quantity.value > 1) quantity.value--
}

function increment() {
  quantity.value++
}
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute left-[20%] top-0 h-full w-[60%] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.03)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-16 lg:flex-row lg:px-20">
      <!-- Image Gallery -->
      <div class="flex w-full flex-col gap-3 lg:w-1/2">
        <div class="aspect-square overflow-hidden rounded-2xl border shadow-[0_16px_60px_rgba(124,58,237,0.2)]" style="border-image: linear-gradient(135deg, #7C3AED44, #EC489944) 1;">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full items-center justify-center bg-gradient-to-br from-pulse-surface to-pulse-bg">
            <span class="text-8xl">🎫</span>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex w-full flex-col gap-6 lg:w-1/2">
        <!-- Badge -->
        <div v-if="product.featured" class="w-fit rounded-full bg-slate-800 px-3 py-0.5">
          <span class="text-xs font-semibold text-slate-50">POPULAIRE</span>
        </div>

        <!-- Name -->
        <h1 class="text-4xl font-bold text-slate-50">{{ product.name }}</h1>

        <!-- Description -->
        <p class="text-base leading-relaxed text-slate-400">{{ product.description }}</p>

        <!-- Price -->
        <div class="flex items-center gap-4">
          <span class="bg-gradient-to-b from-violet-400 to-pink-500 bg-clip-text text-[40px] font-extrabold text-transparent">
            {{ product.price.toFixed(2) }}€
          </span>
        </div>

        <!-- Divider -->
        <div class="h-px w-full bg-slate-700" />

        <!-- Features -->
        <div class="flex flex-col gap-3">
          <div v-for="feat in features" :key="feat" class="flex items-center gap-2.5">
            <Check class="h-[18px] w-[18px] flex-shrink-0 text-green-500" />
            <span class="text-sm text-slate-300">{{ feat }}</span>
          </div>
        </div>

        <!-- Quantity -->
        <div class="flex items-center gap-0">
          <button
            class="flex h-11 w-11 items-center justify-center rounded-md border border-slate-700 bg-pulse-surface text-slate-300 transition-colors hover:bg-slate-700"
            @click="decrement"
          >
            <Minus class="h-4 w-4" />
          </button>
          <div class="flex h-11 w-[60px] items-center justify-center text-base font-semibold text-slate-50">
            {{ quantity }}
          </div>
          <button
            class="flex h-11 w-11 items-center justify-center rounded-md border border-slate-700 bg-pulse-surface text-slate-300 transition-colors hover:bg-slate-700"
            @click="increment"
          >
            <Plus class="h-4 w-4" />
          </button>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            class="flex flex-1 items-center justify-center gap-2 rounded-md bg-pulse-violet px-6 py-3 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-40"
            :disabled="product.stock === 0"
            @click="addItem(product.id, quantity); toast.success(`${quantity} article(s) ajoute(s) au panier`)"
          >
            <ShoppingCart class="h-4 w-4" />
            Ajouter au panier
          </button>
          <button
            class="flex-1 rounded-md border border-slate-600 bg-slate-50 px-6 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-white disabled:opacity-40"
            :disabled="product.stock === 0"
            @click="addItem(product.id, quantity); openCartDrawer()"
          >
            Acheter maintenant
          </button>
        </div>

        <!-- Stock warning -->
        <p v-if="product.stock === 0" class="text-sm font-medium text-red-400">Rupture de stock</p>
        <p v-else-if="product.stock <= 5" class="text-sm font-medium text-orange-400">Plus que {{ product.stock }} en stock</p>

        <!-- Trust row -->
        <div class="flex items-center gap-6">
          <div v-for="item in trustItems" :key="item.label" class="flex items-center gap-1.5">
            <component :is="item.icon" class="h-3.5 w-3.5 text-slate-500" />
            <span class="text-xs text-slate-500">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
