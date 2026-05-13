<script setup lang="ts">
import { Palette, Headphones, MonitorSmartphone, Truck } from 'lucide-vue-next'

const advantages = [
  {
    icon: Palette,
    iconColor: 'text-violet-400',
    bgGradient: 'from-pulse-surface to-[#1a1040]',
    borderGradient: 'linear-gradient(180deg, #334155, #7C3AED44)',
    title: 'Personnalisation',
    description: 'Couleurs, logo et design a votre image. Chaque bracelet represente votre marque.',
  },
  {
    icon: Headphones,
    iconColor: 'text-orange-400',
    bgGradient: 'from-pulse-surface to-[#1f1a2a]',
    borderGradient: 'linear-gradient(180deg, #334155, #F9731644)',
    title: 'Support dedie',
    description: 'Une equipe dediee vous accompagne de la commande au jour de votre evenement.',
  },
  {
    icon: MonitorSmartphone,
    iconColor: 'text-blue-400',
    bgGradient: 'from-pulse-surface to-[#162030]',
    borderGradient: 'linear-gradient(180deg, #334155, #3B82F644)',
    title: 'Dashboard inclus',
    description: 'Acces gratuit au dashboard organisateur pour gerer vos bracelets et analyser votre evenement.',
  },
  {
    icon: Truck,
    iconColor: 'text-green-400',
    bgGradient: 'from-pulse-surface to-[#1a2030]',
    borderGradient: 'linear-gradient(180deg, #334155, #22C55E44)',
    title: 'Livraison rapide',
    description: 'Recevez vos bracelets en 5 jours ouvrables. Option express 48h disponible.',
  },
]
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,58,237,0.04)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <div class="rounded-full border border-slate-600 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-800">POURQUOI PULSE</span>
      </div>

      <h2
        class="bg-gradient-to-b from-slate-50 to-violet-400 bg-clip-text text-center text-4xl font-bold text-transparent"
      >
        Inclus avec chaque bracelet
      </h2>

      <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="adv in advantages"
          :key="adv.title"
          class="flex flex-col items-center gap-4 rounded-xl border p-7"
          :class="`bg-gradient-to-b ${adv.bgGradient}`"
          :style="{ borderImage: `${adv.borderGradient} 1` }"
        >
          <component :is="adv.icon" class="h-8 w-8" :class="adv.iconColor" />
          <h3 class="text-center text-lg font-semibold text-slate-50">{{ adv.title }}</h3>
          <p class="text-center text-sm leading-relaxed text-slate-400">{{ adv.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
