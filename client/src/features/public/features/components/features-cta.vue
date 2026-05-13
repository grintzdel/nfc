<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div
      class="absolute left-[8%] top-[8%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] blur-[60px]"
    />
    <div
      class="absolute bottom-[8%] right-[5%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.08)_0%,transparent_70%)] blur-[50px]"
    />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 lg:px-20">
      <div
        class="flex w-full max-w-[900px] flex-col items-center gap-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-pink-500/20 px-10 py-16 shadow-[0_20px_80px_rgba(124,58,237,0.27),0_0_120px_20px_rgba(236,72,153,0.13)] md:px-20"
      >
        <h2 class="max-w-[700px] text-center text-4xl font-bold text-slate-50">
          Pret a revolutionner vos evenements ?
        </h2>
        <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
          Decouvrez toutes les fonctionnalites en action. Demandez une demo ou commandez directement vos bracelets
          PULSE.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/shop"
            class="rounded-md bg-pulse-violet px-8 py-3 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
          >
            Commander maintenant
          </RouterLink>
          <RouterLink
            to="/contact"
            class="rounded-md border border-slate-600 bg-slate-50 px-8 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-white"
          >
            Demander une demo
          </RouterLink>
        </div>
        <p class="text-center text-[13px] text-slate-500">Demo gratuite. Sans engagement. Livraison en 5 jours.</p>
      </div>
    </div>
  </section>
</template>
