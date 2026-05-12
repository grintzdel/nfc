<script setup lang="ts">
import { Loader2, Package } from 'lucide-vue-next'
import ShopHero from './components/shop-hero.vue'
import ShopAdvantages from './components/shop-advantages.vue'
import EnterpriseCta from './components/enterprise-cta.vue'
import ShopCta from './components/shop-cta.vue'
import ProductCard from '@/modules/product/ui/components/product-card.vue'
import { useGetProducts } from '@/modules/product/ui/hooks/queries/query/use-get-products'
import { EmptyState } from '@/ui/empty-state'

const { data: products, isLoading, isError } = useGetProducts()
</script>

<template>
  <div>
    <ShopHero />

    <section class="relative bg-pulse-bg">
      <div class="absolute -left-[200px] top-[15%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.09)_0%,transparent_70%)]" />
      <div class="absolute right-[5%] top-[45%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.09)_0%,transparent_70%)]" />

      <div class="relative mx-auto max-w-7xl px-6 py-12 lg:px-20">
        <div v-if="isLoading" class="flex items-center justify-center py-32">
          <Loader2 class="h-8 w-8 animate-spin text-violet-400" />
        </div>

        <div v-else-if="isError" class="flex flex-col items-center justify-center gap-4 py-32">
          <p class="text-lg text-slate-400">Impossible de charger les produits.</p>
          <p class="text-sm text-slate-500">Verifiez que le serveur est demarre.</p>
        </div>

        <EmptyState
          v-else-if="!products?.length"
          :icon="Package"
          title="Aucun produit disponible"
          description="Revenez plus tard ou contactez-nous pour une offre sur-mesure."
          size="lg"
        />

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <ShopAdvantages />
    <EnterpriseCta />
    <ShopCta />
  </div>
</template>
