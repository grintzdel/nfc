<script setup lang="ts">
import { Gamepad2, Check } from 'lucide-vue-next'

const benefits = [
  'Vote en direct pour les DJ sets et talks',
  'Check-in automatique sur chaque stand',
  'Jeux concours et gamification integres',
  'Collecte de points et recompenses en temps reel',
]
</script>

<template>
  <section class="relative overflow-hidden bg-pulse-bg">
    <div
      class="absolute right-[20%] top-[15%] h-[400px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.07)_0%,transparent_70%)] blur-[80px]"
    />

    <div class="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-24 lg:flex-row lg:px-20">
      <div class="w-full lg:w-1/2">
        <div
          class="aspect-[4/3] overflow-hidden rounded-2xl border shadow-[0_16px_60px_rgba(59,130,246,0.2),0_0_100px_rgba(6,182,212,0.1)]"
          style="border-image: linear-gradient(135deg, #3b82f644, #06b6d444) 1"
        >
          <div class="flex h-full items-center justify-center bg-gradient-to-br from-pulse-surface to-pulse-bg">
            <div class="text-center">
              <div class="mb-4 text-7xl">🎮</div>
              <p class="text-lg font-semibold text-slate-300">Tap & Interact</p>
              <p class="text-sm text-slate-500">Gamification evenementielle</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col justify-center gap-6 lg:w-1/2">
        <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
          <Gamepad2 class="h-7 w-7 text-white" />
        </div>

        <h2 class="text-4xl font-bold text-slate-50">Tap & Interact</h2>

        <p class="text-base leading-[1.7] text-slate-400">
          Check-in sur un stand, vote pour le prochain DJ set, participe a un jeu concours, gagne des cadeaux. Chaque
          moment de l'evenement devient interactif grace a ton bracelet.
        </p>

        <div class="flex flex-col gap-3.5">
          <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-2.5">
            <Check class="h-[18px] w-[18px] flex-shrink-0 text-green-500" />
            <span class="text-sm text-slate-300">{{ benefit }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
