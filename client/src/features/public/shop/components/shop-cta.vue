<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-24 lg:px-20">
      <div class="flex w-full max-w-[900px] flex-col items-center gap-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-pink-500/20 px-10 py-16 shadow-[0_20px_80px_rgba(124,58,237,0.27)] md:px-20">
        <h2 class="max-w-[700px] text-center text-4xl font-bold text-slate-50">
          Des questions sur nos packs ?
        </h2>
        <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
          Notre equipe est la pour vous aider a choisir le pack adapte a la taille et au type de votre evenement.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/contact"
            class="rounded-md bg-pulse-violet px-8 py-3 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
          >
            Nous contacter
          </RouterLink>
          <RouterLink
            to="/features"
            class="rounded-md border border-slate-600 bg-slate-50 px-8 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-white"
          >
            Voir les fonctionnalites
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
