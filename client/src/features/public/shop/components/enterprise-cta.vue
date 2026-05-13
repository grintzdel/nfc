<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const perks = [
  'Tarifs degressifs a partir de 2000 unites',
  'Chef de projet dedie',
  'Design 100% sur-mesure',
  'Support technique jour J inclus',
]
</script>

<template>
  <section
    class="relative"
    style="
      background: conic-gradient(from 0deg at 50% 50%, #0f172a 0%, #1a0a2e 25%, #0f172a 50%, #1a1030 75%, #0f172a 100%);
    "
  >
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:px-20">
      <div class="w-full lg:w-1/2">
        <div
          class="aspect-[4/3] overflow-hidden rounded-2xl border shadow-[0_16px_60px_rgba(124,58,237,0.2)]"
          style="border-image: linear-gradient(135deg, #7c3aed44, #f9731644) 1"
        >
          <div class="flex h-full items-center justify-center bg-gradient-to-br from-pulse-surface to-pulse-bg">
            <div class="text-center">
              <div class="mb-4 text-7xl">🏢</div>
              <p class="text-lg font-semibold text-slate-300">Solution Entreprise</p>
              <p class="text-sm text-slate-500">+2000 bracelets</p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col gap-6 lg:w-1/2">
        <div class="w-fit rounded-full bg-slate-800 px-3 py-0.5">
          <span class="text-xs font-semibold text-slate-50">ENTREPRISE</span>
        </div>

        <h2 class="text-4xl font-bold text-slate-50">Besoin de +2000 bracelets ?</h2>

        <p class="text-base leading-[1.7] text-slate-400">
          Pour les grands festivals et evenements corporate, nous proposons des tarifs degressifs, un accompagnement
          premium et une personnalisation totale de vos bracelets PULSE.
        </p>

        <div class="flex flex-col gap-3">
          <div v-for="perk in perks" :key="perk" class="flex items-center gap-2.5">
            <Check class="h-[18px] w-[18px] flex-shrink-0 text-green-500" />
            <span class="text-sm text-slate-300">{{ perk }}</span>
          </div>
        </div>

        <div class="flex items-center gap-4 pt-2">
          <RouterLink
            to="/contact"
            class="rounded-md bg-pulse-violet px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
          >
            Demander un devis
          </RouterLink>
          <a
            href="tel:+33123456789"
            class="rounded-md border border-slate-600 bg-slate-50 px-6 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-white"
          >
            Nous appeler
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
