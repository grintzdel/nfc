<script setup lang="ts">
import { Ticket, Users, BarChart3 } from 'lucide-vue-next'

const features = [
  {
    icon: Ticket,
    iconColor: 'text-violet-400',
    glowColor: 'shadow-violet-600/15',
    borderGradient: 'from-violet-600/40 via-orange-500/25 to-violet-500/25',
    bgGradient: 'from-pulse-surface to-[#1a1535]',
    title: 'Acces instantane',
    description:
      "Un simple tap de ton bracelet NFC et tu es a l'interieur. Plus de tickets papier, plus de QR codes, plus d'attente.",
  },
  {
    icon: Users,
    iconColor: 'text-orange-400',
    glowColor: 'shadow-orange-500/15',
    borderGradient: 'from-orange-500/40 via-violet-500/25 to-orange-500/25',
    bgGradient: 'from-pulse-surface to-[#1f1a2a]',
    title: 'Connecte-toi',
    description:
      'Echange tes reseaux, partage tes photos et retrouve les personnes croisees en soiree. Ton bracelet devient ta carte de visite.',
  },
  {
    icon: BarChart3,
    iconColor: 'text-blue-400',
    glowColor: 'shadow-blue-500/15',
    borderGradient: 'from-blue-500/40 via-cyan-400/25 to-blue-500/25',
    bgGradient: 'from-pulse-surface to-[#162030]',
    title: 'Dashboard live',
    description:
      "Les organisateurs suivent en temps reel les flux, les zones chaudes et l'engagement. Tout est pilote depuis le dashboard PULSE.",
  },
]
</script>

<template>
  <section id="features" class="relative bg-pulse-bg">
    <div class="absolute inset-0 opacity-40">
      <div
        class="absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,#2d1055_0%,transparent_60%)]"
      />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <div class="text-center">
        <p class="mb-4 text-sm font-semibold tracking-[2px] text-slate-500">EXPERIENCE</p>
        <h2 class="max-w-[800px] text-4xl font-bold text-slate-50">Ton bracelet fait tout</h2>
        <p class="mx-auto mt-4 max-w-[600px] text-lg leading-relaxed text-slate-400">
          En festival, en concert ou en soiree — ton poignet remplace ton telephone.
        </p>
      </div>

      <div class="grid w-full grid-cols-1 gap-7 md:grid-cols-3">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl border p-8"
          :class="[
            `bg-gradient-to-b ${feature.bgGradient}`,
            `border-gradient`,
            `shadow-[0_8px_32px] ${feature.glowColor}`,
          ]"
          :style="{
            borderImage: `linear-gradient(160deg, ${feature.borderGradient.includes('violet') ? '#7C3AED66, #F9731644, #7C3AED44' : feature.borderGradient.includes('orange') ? '#F9731666, #7C3AED44, #F9731644' : '#3B82F666, #06B6D444, #3B82F644'}) 1`,
          }"
        >
          <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
            <component :is="feature.icon" class="h-6 w-6" :class="feature.iconColor" />
          </div>
          <h3 class="mb-3 text-xl font-semibold text-slate-100">{{ feature.title }}</h3>
          <p class="text-sm leading-relaxed text-slate-400">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
