<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="relative"
    style="
      background: conic-gradient(
        from 0deg at 50% 50%,
        #0f172a 0%,
        #1a0a2e 25%,
        #0f172a 50%,
        #2d105488 75%,
        #0f172a 100%
      );
    "
  >
    <div class="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 lg:px-20">
      <div
        class="flex w-full max-w-[900px] flex-col items-center gap-8 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-pink-500/20 px-10 py-16 shadow-[0_20px_80px_rgba(124,58,237,0.27)] md:px-20"
      >
        <h2 class="max-w-[700px] text-center text-4xl font-bold text-slate-50">Besoin d'un pack sur mesure ?</h2>
        <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
          Contactez-nous pour un devis personnalise adapte a votre evenement.
        </p>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/contact"
            class="rounded-md bg-pulse-violet px-8 py-3 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
          >
            Demander un devis
          </RouterLink>
          <RouterLink
            to="/shop"
            class="rounded-md border border-slate-600 bg-slate-50 px-8 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-white"
          >
            Retour au catalogue
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
