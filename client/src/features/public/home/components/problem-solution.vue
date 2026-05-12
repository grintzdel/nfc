<script setup lang="ts">
import { X, Check } from 'lucide-vue-next'

const beforeItems = [
  { icon: '😤', text: 'File d\'attente interminable a l\'entree' },
  { icon: '📱', text: 'Telephone decharge en plein concert' },
  { icon: '💸', text: 'Cash only pour les boissons' },
  { icon: '🤷', text: 'Aucun moyen de retrouver ses amis' },
]

const afterItems = [
  { icon: '⚡', text: 'Entree en moins de 0.3 seconde' },
  { icon: '🎶', text: 'Tout au poignet, zero ecran' },
  { icon: '💳', text: 'Paiement NFC sans contact' },
  { icon: '📍', text: 'Localisation et connexion instantanee' },
]
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 opacity-50">
      <div class="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,#1a0a2e_0%,transparent_70%)]" />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-24 lg:px-20">
      <div class="text-center">
        <p class="mb-4 text-sm font-semibold tracking-[2px] text-slate-500">L'EXPERIENCE REPENSEE</p>
        <h2 class="max-w-[800px] text-4xl font-bold text-slate-50">
          Fini les galeres en soiree
        </h2>
      </div>

      <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Before -->
        <div class="rounded-xl border border-slate-700 bg-gradient-to-b from-pulse-surface to-[#172033] p-8 shadow-[0_4px_24px_rgba(239,68,68,0.13)]">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
              <X class="h-5 w-5 text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-slate-300">Avant PULSE</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="item in beforeItems" :key="item.text" class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm text-slate-400">{{ item.text }}</p>
            </div>
          </div>
        </div>

        <!-- After -->
        <div class="rounded-xl border border-violet-500/40 bg-gradient-to-b from-pulse-surface to-[#1a1535] p-8 shadow-[0_8px_40px_rgba(124,58,237,0.3),0_0_80px_rgba(124,58,237,0.2)]">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
              <Check class="h-5 w-5 text-violet-400" />
            </div>
            <h3 class="text-lg font-semibold text-slate-200">Avec PULSE</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div v-for="item in afterItems" :key="item.text" class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm text-slate-300">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
