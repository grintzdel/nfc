<script setup lang="ts">
import { Ticket, Check } from 'lucide-vue-next'

const benefits = [
  'Entree en moins d\'1 seconde',
  'Compatible tous portiques NFC',
  'Fonctionne sans batterie ni app',
  'Anti-fraude integre',
]
</script>

<template>
  <section id="feature-1" class="relative bg-pulse-bg">
    <div class="absolute left-0 top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.12)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-20 lg:flex-row lg:px-20">
      <div class="w-full lg:w-1/2">
        <div class="aspect-square overflow-hidden rounded-2xl border border-violet-500/15 bg-gradient-to-br from-pulse-surface to-pulse-bg">
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <div class="mb-4 text-7xl">⚡</div>
              <p class="text-lg font-semibold text-slate-300">Tap & Go</p>
              <p class="text-sm text-slate-500">Acces instantane</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col gap-6 lg:w-1/2">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800">
            <Ticket class="h-7 w-7 text-white" />
          </div>
          <span class="text-sm font-semibold tracking-[1px] text-violet-400">Acces</span>
        </div>

        <h2 class="text-5xl font-extrabold text-slate-50">Tap & Go</h2>

        <p class="text-lg leading-[1.7] text-slate-400">
          Entrez dans l'evenement en 1 seconde. Le bracelet EST votre billet — pas de QR codes, pas de files d'attente, pas de stress.
        </p>

        <div class="flex flex-col gap-4">
          <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3">
            <Check class="h-5 w-5 flex-shrink-0 text-green-500" />
            <span class="text-base font-medium text-slate-50">{{ benefit }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="h-px w-full bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
  </section>
</template>
