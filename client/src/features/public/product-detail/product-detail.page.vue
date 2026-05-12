<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { Loader2, ChevronRight } from 'lucide-vue-next'
import ProductHero from './components/product-hero.vue'
import ProductSpecs from './components/product-specs.vue'
import RelatedProducts from './components/related-products.vue'
import ProductDetailCta from './components/product-detail-cta.vue'
import { useGetProductBySlug } from '@/modules/product/ui/hooks/queries/query/use-get-product-by-slug'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { data: product, isLoading, isError } = useGetProductBySlug(slug)
</script>

<template>
  <div v-if="isLoading" class="flex min-h-[60vh] items-center justify-center bg-pulse-bg">
    <Loader2 class="h-8 w-8 animate-spin text-violet-400" />
  </div>

  <div v-else-if="isError || !product" class="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-pulse-bg">
    <span class="text-5xl">😔</span>
    <p class="text-lg text-slate-400">Produit introuvable.</p>
    <RouterLink to="/shop" class="text-sm text-violet-400 hover:underline">Retour au catalogue</RouterLink>
  </div>

  <div v-else>
    <div class="border-b border-slate-700 bg-pulse-bg px-6 py-4 lg:px-20">
      <div class="mx-auto flex max-w-7xl items-center gap-2">
        <RouterLink to="/shop" class="text-[13px] text-slate-500 hover:text-slate-300">Catalogue</RouterLink>
        <ChevronRight class="h-3 w-3 text-slate-500" />
        <span class="text-[13px] font-medium text-slate-400">{{ product.name }}</span>
      </div>
    </div>

    <ProductHero :product="product" />
    <ProductSpecs />
    <RelatedProducts :current-product-id="product.id" />
    <ProductDetailCta />
  </div>
</template>
