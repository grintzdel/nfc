<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section id="contact" class="relative bg-pulse-bg">
    <!-- Background glows -->
    <div class="absolute inset-0">
      <div class="absolute left-[10%] top-[10%] h-[400px] w-[400px] rounded-full bg-violet-600/8 blur-[60px]" />
      <div class="absolute bottom-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-pink-500/6 blur-[50px]" />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 lg:px-20">
      <div class="flex w-full max-w-[900px] flex-col items-center gap-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-pink-500/20 px-10 py-16 shadow-[0_20px_80px_rgba(124,58,237,0.27),0_0_120px_20px_rgba(236,72,153,0.13)] md:px-20">
        <h2 class="max-w-[700px] text-center text-4xl font-bold text-slate-50">
          Pret a vivre l'experience PULSE ?
        </h2>
        <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
          Rejoignez les festivals, concerts et soirees qui ont choisi PULSE pour offrir une experience sans friction a leurs festivaliers.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/shop"
            class="rounded-md bg-pulse-violet px-8 py-3 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
          >
            Commander mon pass
          </RouterLink>
          <RouterLink
            to="/contact"
            class="rounded-md border border-white/10 bg-slate-950 px-8 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Nous contacter
          </RouterLink>
        </div>
        <p class="text-center text-[13px] text-slate-500">
          Livraison sous 5 jours ouvrables. Support dedie.
        </p>
      </div>
    </div>
  </section>
</template>
