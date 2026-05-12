<script setup lang="ts">
const stats = [
  { value: '4', label: 'Co-fondateurs passionnes', color: 'text-violet-400' },
  { value: '2024', label: 'Annee de creation', color: 'text-orange-400' },
  { value: '50+', label: 'Festivals partenaires', color: 'text-blue-400' },
  { value: '500K+', label: 'Festivaliers connectes', color: 'text-green-400' },
]
</script>

<template>
  <section class="border-y border-slate-700 bg-gradient-to-r from-pulse-bg via-pulse-surface to-pulse-bg">
    <div class="mx-auto flex max-w-7xl items-center justify-around px-6 py-20 lg:px-20">
      <div v-for="stat in stats" :key="stat.label" class="flex flex-col items-center gap-2">
        <span class="text-5xl font-extrabold" :class="stat.color">{{ stat.value }}</span>
        <span class="text-sm text-slate-400">{{ stat.label }}</span>
      </div>
    </div>
  </section>
</template>
