<script setup lang="ts">
const specsLeft = [
  { key: 'Quantite', value: '200 bracelets' },
  { key: 'Technologie', value: 'NFC NTAG215' },
  { key: 'Portee NFC', value: '< 5 cm' },
  { key: 'Materiau', value: 'Silicone medical' },
]

const specsRight = [
  { key: 'Etancheite', value: 'IP67 waterproof' },
  { key: 'Couleurs dispo', value: '8 coloris + custom' },
  { key: 'Memoire', value: '504 bytes' },
  { key: 'Reutilisable', value: 'Oui, reprogrammable' },
]
</script>

<template>
  <section class="border-t border-slate-700 bg-pulse-bg">
    <div class="mx-auto max-w-7xl px-6 py-20 lg:px-20">
      <h2 class="mb-12 text-[28px] font-bold text-slate-50">Specifications techniques</h2>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div class="flex flex-col">
          <div
            v-for="spec in specsLeft"
            :key="spec.key"
            class="flex items-center justify-between border-b border-pulse-surface py-3"
          >
            <span class="text-sm text-slate-400">{{ spec.key }}</span>
            <span class="text-sm font-medium text-slate-50">{{ spec.value }}</span>
          </div>
        </div>

        <div class="flex flex-col">
          <div
            v-for="spec in specsRight"
            :key="spec.key"
            class="flex items-center justify-between border-b border-pulse-surface py-3"
          >
            <span class="text-sm text-slate-400">{{ spec.key }}</span>
            <span class="text-sm font-medium text-slate-50">{{ spec.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
