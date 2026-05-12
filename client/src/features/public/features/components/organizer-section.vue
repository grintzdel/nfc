<script setup lang="ts">
import { BarChart3, MapPin, Users, ShieldCheck } from 'lucide-vue-next'

const cards = [
  {
    icon: BarChart3,
    iconColor: 'text-violet-400',
    borderGradient: 'linear-gradient(180deg, #334155, #7C3AED44)',
    bgGradient: 'from-pulse-surface to-[#1a1040]',
    title: 'Analytics en direct',
    description: 'Affluence par zone, taux d\'engagement, pics d\'activite — tout en temps reel.',
  },
  {
    icon: MapPin,
    iconColor: 'text-orange-400',
    borderGradient: 'linear-gradient(180deg, #334155, #F9731644)',
    bgGradient: 'from-pulse-surface to-[#1a1535]',
    title: 'Heatmap des zones',
    description: 'Visualisez ou se concentrent vos festivaliers pour optimiser la securite et les flux.',
  },
  {
    icon: Users,
    iconColor: 'text-blue-400',
    borderGradient: 'linear-gradient(180deg, #334155, #3B82F644)',
    bgGradient: 'from-pulse-surface to-[#162030]',
    title: 'Gestion des participants',
    description: 'Assignez, activez et desactivez les bracelets. Gerez les acces VIP et les permissions.',
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-green-400',
    borderGradient: 'linear-gradient(180deg, #334155, #22C55E44)',
    bgGradient: 'from-pulse-surface to-[#1a2030]',
    title: 'Securite anti-fraude',
    description: 'Chaque bracelet est unique et crypte. Detection des doublons et alertes en temps reel.',
  },
]
</script>

<template>
  <section class="relative" style="background: conic-gradient(from 0deg at 50% 50%, #0F172A 0%, #1a0a2e 25%, #0F172A 50%, #1a1030 75%, #0F172A 100%);">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 lg:px-20">
      <div class="rounded-full bg-slate-800 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-50">POUR LES ORGANISATEURS</span>
      </div>

      <h2 class="max-w-[800px] text-center text-4xl font-bold text-slate-50">
        Pilotez votre evenement comme un pro
      </h2>

      <p class="max-w-[640px] text-center text-lg leading-relaxed text-slate-400">
        Le dashboard PULSE donne aux organisateurs une vue complete en temps reel : affluence, interactions, revenus et engagement.
      </p>

      <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <div
          v-for="card in cards"
          :key="card.title"
          class="rounded-xl border p-7"
          :class="`bg-gradient-to-b ${card.bgGradient}`"
          :style="{ borderImage: `${card.borderGradient} 1` }"
        >
          <component :is="card.icon" class="mb-4 h-8 w-8" :class="card.iconColor" />
          <h3 class="mb-2 text-lg font-semibold text-slate-50">{{ card.title }}</h3>
          <p class="text-sm leading-relaxed text-slate-400">{{ card.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
