<script setup lang="ts">
import { Users, Check } from 'lucide-vue-next'

const benefits = [
  'Echange de profils en 1 tap',
  'Connexion LinkedIn/Instagram automatique',
  'Historique des rencontres dans l\'app',
  'Mode soiree pour contacts festifs',
]
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute right-0 top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.12)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-16 px-6 py-20 lg:flex-row lg:px-20">
      <div class="flex w-full flex-col gap-6 lg:w-1/2">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700">
            <Users class="h-7 w-7 text-white" />
          </div>
          <span class="text-sm font-semibold tracking-[1px] text-orange-400">Networking</span>
        </div>

        <h2 class="text-5xl font-extrabold text-slate-50">Tap & Connect</h2>

        <p class="text-lg leading-[1.7] text-slate-400">
          Tapez bracelet contre bracelet pour echanger vos profils. Le networking devient physique, instantane et memorable.
        </p>

        <div class="flex flex-col gap-4">
          <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3">
            <Check class="h-5 w-5 flex-shrink-0 text-green-500" />
            <span class="text-base font-medium text-slate-50">{{ benefit }}</span>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2">
        <div class="aspect-square overflow-hidden rounded-2xl border border-orange-500/15 bg-gradient-to-br from-pulse-surface to-pulse-bg">
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <div class="mb-4 text-7xl">🤝</div>
              <p class="text-lg font-semibold text-slate-300">Tap & Connect</p>
              <p class="text-sm text-slate-500">Networking instantane</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
