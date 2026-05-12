<script setup lang="ts">
import { Zap } from 'lucide-vue-next'
</script>

<template>
  <section class="relative overflow-hidden bg-pulse-bg">
    <!-- Glows -->
    <div class="absolute left-[30%] top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.25)_0%,transparent_70%)] opacity-60" />
    <div class="absolute right-[10%] top-[25%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] opacity-50" />
    <div class="absolute left-[7%] top-[40%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.15)_0%,transparent_70%)] opacity-40" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pb-24 pt-32 lg:px-20">
      <!-- Badge -->
      <div class="flex items-center gap-2 rounded-full border border-violet-500/40 bg-gradient-to-b from-violet-600/20 to-violet-600/5 px-4 py-1.5">
        <Zap class="h-3.5 w-3.5 text-violet-400" />
        <span class="text-xs font-semibold tracking-[2px] text-violet-400">FONCTIONNALITES</span>
      </div>

      <!-- Headline -->
      <h1 class="max-w-[900px] bg-gradient-to-b from-slate-50 to-slate-400 bg-clip-text text-center text-5xl font-extrabold leading-[1.1] text-transparent md:text-6xl lg:text-[64px]">
        Trois super-pouvoirs<br>dans un bracelet
      </h1>

      <!-- Subtitle -->
      <p class="max-w-[700px] text-center text-lg leading-relaxed text-slate-400 md:text-xl">
        PULSE transforme chaque tap NFC en experience digitale.<br>
        Acces, paiement, networking — tout dans un bracelet.
      </p>

      <!-- CTAs -->
      <div class="flex items-center gap-4">
        <a
          href="#feature-1"
          class="rounded-md bg-gradient-to-b from-violet-600 to-violet-800 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-violet-500/25"
        >
          Decouvrir les fonctionnalites
        </a>
        <a
          href="#how-it-works"
          class="rounded-md border border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
        >
          Voir la demo
        </a>
      </div>
    </div>

    <!-- Divider -->
    <div class="h-px w-full bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
  </section>
</template>
