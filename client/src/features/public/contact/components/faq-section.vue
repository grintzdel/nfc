<script setup lang="ts">
import { computed } from 'vue'
import { useGetFaqs } from '@/modules/marketing/ui/hooks/queries/query/use-get-faqs'
import { Skeleton } from '@/ui/skeleton'

const GRADIENTS = [
  'from-pulse-surface to-[#1a1040]',
  'from-pulse-surface to-[#1f1a2a]',
  'from-pulse-surface to-[#162030]',
  'from-pulse-surface to-[#1a1535]',
  'from-pulse-surface to-[#1a2030]',
  'from-pulse-surface to-[#172030]',
]

const { data: faqs, isLoading, isError } = useGetFaqs()

const columns = computed(() => {
  const items = faqs.value ?? []
  const half = Math.ceil(items.length / 2)
  const styled = items.map((faq, i) => ({ ...faq, bgGradient: GRADIENTS[i % GRADIENTS.length] }))
  return { left: styled.slice(0, half), right: styled.slice(half) }
})
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,58,237,0.04)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <div class="rounded-full border border-slate-600 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-800">FAQ</span>
      </div>

      <h2 class="bg-gradient-to-b from-slate-50 to-violet-400 bg-clip-text text-center text-4xl font-bold text-transparent">
        Questions frequentes
      </h2>

      <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
        Tout ce que vous devez savoir avant de nous contacter.
      </p>

      <div v-if="isLoading" class="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <div v-for="col in 2" :key="col" class="flex flex-col gap-5">
          <div v-for="i in 3" :key="i" class="flex flex-col gap-3 rounded-xl border border-slate-700 p-6">
            <Skeleton class="h-5 w-2/3" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
          </div>
        </div>
      </div>

      <p v-else-if="isError" class="text-sm text-red-400">
        Impossible de charger la FAQ pour le moment.
      </p>

      <div v-else-if="(faqs ?? []).length > 0" class="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <div class="flex flex-col gap-5">
          <div
            v-for="faq in columns.left"
            :key="faq.id"
            class="rounded-xl border border-slate-700 p-6"
            :class="`bg-gradient-to-b ${faq.bgGradient}`"
          >
            <h3 class="mb-3 text-base font-semibold text-slate-50">{{ faq.question }}</h3>
            <p class="text-sm leading-relaxed text-slate-400">{{ faq.answer }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div
            v-for="faq in columns.right"
            :key="faq.id"
            class="rounded-xl border border-slate-700 p-6"
            :class="`bg-gradient-to-b ${faq.bgGradient}`"
          >
            <h3 class="mb-3 text-base font-semibold text-slate-50">{{ faq.question }}</h3>
            <p class="text-sm leading-relaxed text-slate-400">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
