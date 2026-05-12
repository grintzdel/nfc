<script setup lang="ts">
import { Activity, Users, MapPin, TrendingUp } from 'lucide-vue-next'
</script>

<template>
  <section id="events" class="relative bg-pulse-bg">
    <div class="absolute inset-0 opacity-45">
      <div class="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,#2d1055_0%,transparent_50%)]" />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 lg:px-20">
      <div class="text-center">
        <p class="mb-4 text-sm font-semibold tracking-[2px] text-slate-500">POUR LES ORGANISATEURS</p>
        <h2 class="max-w-[800px] text-4xl font-bold text-slate-50">
          Votre festival en temps reel
        </h2>
        <p class="mx-auto mt-4 max-w-[640px] text-lg leading-relaxed text-slate-400">
          Suivez chaque festivalier, analysez les flux entre les scenes et optimisez l'ambiance grace au dashboard PULSE.
        </p>
      </div>

      <!-- Dashboard mockup -->
      <div class="w-full max-w-[1100px] overflow-hidden rounded-xl border border-slate-700 bg-pulse-surface shadow-[0_16px_64px_8px_rgba(124,58,237,0.27),0_0_120px_rgba(124,58,237,0.13),0_8px_24px_rgba(0,0,0,0.33)]">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <div class="flex items-center gap-3">
            <Activity class="h-5 w-5 text-violet-400" />
            <span class="text-sm font-semibold text-slate-200">PULSE Dashboard</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-3 w-3 rounded-full bg-green-500" />
            <span class="text-xs text-slate-400">Live</span>
          </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
          <div class="rounded-lg bg-white/5 p-4">
            <div class="mb-2 flex items-center gap-2">
              <Users class="h-4 w-4 text-violet-400" />
              <span class="text-xs text-slate-400">Participants actifs</span>
            </div>
            <p class="text-2xl font-bold text-slate-100">12,847</p>
            <p class="mt-1 text-xs text-green-400">+23% vs hier</p>
          </div>
          <div class="rounded-lg bg-white/5 p-4">
            <div class="mb-2 flex items-center gap-2">
              <MapPin class="h-4 w-4 text-orange-400" />
              <span class="text-xs text-slate-400">Zone la plus active</span>
            </div>
            <p class="text-2xl font-bold text-slate-100">Main Stage</p>
            <p class="mt-1 text-xs text-slate-500">4,231 personnes</p>
          </div>
          <div class="rounded-lg bg-white/5 p-4">
            <div class="mb-2 flex items-center gap-2">
              <TrendingUp class="h-4 w-4 text-green-400" />
              <span class="text-xs text-slate-400">Taps / heure</span>
            </div>
            <p class="text-2xl font-bold text-slate-100">8,392</p>
            <p class="mt-1 text-xs text-green-400">+12% pic</p>
          </div>
        </div>

        <!-- Chart placeholder -->
        <div class="px-6 pb-6">
          <div class="flex h-48 items-end justify-around rounded-lg bg-white/[0.03] p-4">
            <div v-for="(h, i) in [40, 55, 35, 70, 85, 65, 90, 75, 60, 80, 95, 50]" :key="i" class="w-[6%] rounded-t bg-gradient-to-t from-violet-600/60 to-violet-400/80" :style="{ height: `${h}%` }" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
