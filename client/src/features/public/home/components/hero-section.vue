<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- Background mesh gradient -->
    <div class="absolute inset-0 bg-pulse-bg">
      <div class="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
      <div class="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-orange-500/10 blur-[80px]" />
      <div class="absolute right-1/3 top-1/3 h-[300px] w-[400px] rounded-full bg-pink-500/8 blur-[100px]" />
    </div>

    <!-- Decorative elements -->
    <div class="pointer-events-none absolute inset-0">
      <Sparkles class="absolute left-[20%] top-[15%] h-5 w-5 text-violet-400/30" />
      <Sparkles class="absolute left-[15%] top-[40%] h-3.5 w-3.5 text-pink-500/25" />
      <div class="absolute left-[23%] top-[22%] h-1 w-1 rounded-full bg-violet-400/40" />
      <div class="absolute right-[10%] top-[15%] h-0.5 w-0.5 rounded-full bg-orange-500/35" />
      <div class="absolute right-[15%] top-[20%] h-[200px] w-[200px] rounded-full border-2 border-violet-600/20 opacity-40 blur-[3px]" />
      <div class="absolute left-[6%] top-[55%] h-[150px] w-[150px] rounded-full border-2 border-orange-500/15 opacity-30 blur-[3px]" />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pb-24 pt-32 lg:px-20">
      <!-- Badge -->
      <div class="rounded-full border border-violet-500/50 bg-gradient-to-r from-violet-600/25 to-pink-500/25 px-4 py-1">
        <span class="bg-gradient-to-b from-violet-200 to-orange-200 bg-clip-text text-xs font-semibold text-transparent">
          Festivals · Concerts · Conferences · Soirees
        </span>
      </div>

      <!-- Headline -->
      <h1 class="max-w-[900px] bg-gradient-to-b from-slate-50 via-violet-400 to-slate-50 bg-clip-text text-center text-5xl font-extrabold leading-tight text-transparent md:text-6xl lg:text-[64px]">
        Vibrez. Connectez. Vivez.
      </h1>

      <!-- Subtitle -->
      <p class="max-w-[720px] text-center text-lg leading-relaxed text-slate-400 md:text-xl">
        PULSE transforme chaque bracelet NFC en passeport intelligent pour vos soirees et festivals. Un tap pour entrer, un tap pour se connecter, un tap pour vivre l'experience a fond.
      </p>

      <!-- CTA Buttons -->
      <div class="flex items-center gap-4">
        <RouterLink
          to="/shop"
          class="rounded-md bg-pulse-violet px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
        >
          Decouvrir les pass
        </RouterLink>
        <a
          href="#features"
          class="rounded-md border border-white/10 bg-slate-950 px-6 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:border-white/20 hover:text-white"
        >
          En savoir plus
        </a>
      </div>

      <!-- Hero Image -->
      <div class="mt-8 w-full max-w-[1000px] overflow-hidden rounded-2xl border border-violet-500/15 shadow-[0_30px_100px_-20px_rgba(124,58,237,0.3),0_0_150px_-30px_rgba(249,115,22,0.13)]">
        <div class="relative aspect-[2/1] w-full bg-gradient-to-b from-pulse-surface to-pulse-bg">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="mb-4 text-6xl">🎫</div>
              <p class="text-lg font-semibold text-slate-300">PULSE Event Pass</p>
              <p class="text-sm text-slate-500">Votre experience commence ici</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
