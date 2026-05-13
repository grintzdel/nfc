<script setup lang="ts">
import { Music, Users, Zap, Timer } from 'lucide-vue-next'

const stats = [
  { icon: Music, iconColor: 'text-violet-600', value: '150+', label: 'Festivals equipes' },
  { icon: Users, iconColor: 'text-violet-600', value: '500K+', label: 'Festivaliers connectes' },
  { icon: Zap, iconColor: 'text-orange-500', value: '2M+', label: 'Taps en soiree' },
  { icon: Timer, iconColor: 'text-orange-500', value: '< 0.3s', label: 'Pour entrer' },
]
</script>

<template>
  <section class="relative">
    <div class="absolute inset-0 bg-gradient-to-b from-pulse-bg via-[#1a0a2e] to-pulse-bg">
      <div
        class="absolute left-[30%] top-0 h-full w-[40%] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]"
      />
      <div
        class="absolute right-[20%] top-0 h-full w-[30%] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.1)_0%,transparent_70%)]"
      />
    </div>

    <div
      class="relative mx-auto grid max-w-7xl grid-cols-2 items-center gap-8 px-6 py-20 sm:gap-12 md:grid-cols-4 lg:px-20"
    >
      <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center gap-3 text-center">
        <component :is="stat.icon" class="h-8 w-8" :class="stat.iconColor" />
        <span class="text-3xl font-extrabold text-violet-400 sm:text-4xl md:text-5xl">{{ stat.value }}</span>
        <span class="text-sm font-medium text-slate-400">{{ stat.label }}</span>
      </div>
    </div>
  </section>
</template>
