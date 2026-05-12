<script setup lang="ts">
import { Heart, Sparkles, Shield, Leaf } from 'lucide-vue-next'

const values = [
  {
    icon: Heart,
    gradient: 'from-violet-600 to-pink-500',
    bgGradient: 'from-pulse-surface to-[#1a1040]',
    borderGradient: 'linear-gradient(180deg, #334155, #7C3AED44)',
    title: 'Passion',
    description: 'Nes dans les festivals, on construit pour les gens qui vivent la musique et les rencontres. Chaque feature nait d\'une experience reelle.',
  },
  {
    icon: Sparkles,
    gradient: 'from-orange-500 to-orange-400',
    bgGradient: 'from-pulse-surface to-[#1f1a2a]',
    borderGradient: 'linear-gradient(180deg, #334155, #F9731644)',
    title: 'Simplicite',
    description: 'La meilleure techno est celle qu\'on ne remarque pas. Un tap, c\'est tout. Pas d\'app a telecharger, pas de QR code a scanner.',
  },
  {
    icon: Shield,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-pulse-surface to-[#162030]',
    borderGradient: 'linear-gradient(180deg, #334155, #3B82F644)',
    title: 'Confiance',
    description: 'Securite zero compromis. Chaque bracelet est crypte, chaque donnee protegee. Vos festivaliers meritent une techno fiable.',
  },
  {
    icon: Leaf,
    gradient: 'from-green-500 to-green-400',
    bgGradient: 'from-pulse-surface to-[#1a2030]',
    borderGradient: 'linear-gradient(180deg, #334155, #22C55E44)',
    title: 'Impact',
    description: 'Chaque bracelet NFC remplace des tonnes de billets papier. On construit une techno evenementielle durable et responsable.',
  },
]
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,58,237,0.05)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <!-- Badge -->
      <div class="rounded-full border border-slate-600 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-800">NOS VALEURS</span>
      </div>

      <h2 class="bg-gradient-to-b from-slate-50 to-violet-400 bg-clip-text text-center text-4xl font-bold text-transparent">
        Ce en quoi on croit
      </h2>

      <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div
          v-for="value in values"
          :key="value.title"
          class="flex flex-col items-center gap-5 rounded-2xl border p-8"
          :class="`bg-gradient-to-b ${value.bgGradient}`"
          :style="{ borderImage: `${value.borderGradient} 1` }"
        >
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br"
            :class="value.gradient"
          >
            <component :is="value.icon" class="h-6 w-6 text-white" />
          </div>
          <h3 class="text-xl font-bold text-slate-50">{{ value.title }}</h3>
          <p class="text-center text-sm leading-relaxed text-slate-400">{{ value.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
