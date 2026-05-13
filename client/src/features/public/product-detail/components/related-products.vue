<script setup lang="ts">
import { computed } from 'vue'

import ProductCard from '@/modules/product/ui/components/product-card.vue'
import { useGetProducts } from '@/modules/product/ui/hooks/queries/query/use-get-products'

const props = defineProps<{
  currentProductId: string
}>()

const { data: allProducts } = useGetProducts()

const relatedProducts = computed(() => {
  if (!allProducts.value) return []
  return allProducts.value.filter((p) => p.id !== props.currentProductId).slice(0, 3)
})
</script>

<template>
  <section v-if="relatedProducts.length" class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(124,58,237,0.03)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:px-20">
      <h2 class="text-[28px] font-bold text-slate-50">Vous pourriez aussi aimer</h2>

      <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <ProductCard v-for="product in relatedProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>
