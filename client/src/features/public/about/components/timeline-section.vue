<script setup lang="ts">
const milestones = [
  {
    date: '2024',
    dateColor: 'text-violet-400',
    dotColor: 'bg-violet-600',
    dotGlow: 'shadow-violet-600/30',
    borderColor: 'border-violet-500/20',
    title: 'L\'idee nait',
    description: 'Lors d\'un festival, nos fondateurs perdent leurs billets. L\'idee d\'un bracelet NFC universel germe instantanement.',
  },
  {
    date: '2024',
    dateColor: 'text-orange-400',
    dotColor: 'bg-orange-500',
    dotGlow: 'shadow-orange-500/30',
    borderColor: 'border-orange-500/20',
    title: 'Premier prototype',
    description: 'Le premier bracelet NFC PULSE est teste lors d\'un evenement local. Les retours sont unanimes : l\'experience est revolutionnaire.',
  },
  {
    date: '2025',
    dateColor: 'text-violet-400',
    dotColor: 'bg-violet-600',
    dotGlow: 'shadow-violet-600/30',
    borderColor: 'border-violet-500/20',
    title: 'Lancement beta',
    description: '3 festivals partenaires adoptent PULSE en version beta. Plus de 5 000 festivaliers testent le bracelet connecte.',
  },
  {
    date: '2025',
    dateColor: 'text-orange-400',
    dotColor: 'bg-orange-500',
    dotGlow: 'shadow-orange-500/30',
    borderColor: 'border-orange-500/20',
    title: 'PULSE v1.0',
    description: 'Lancement officiel avec plus de 50 evenements embarques. PULSE devient la reference NFC pour les festivals en France.',
  },
]
</script>

<template>
  <section class="relative bg-pulse-bg py-20">
    <div class="absolute left-[30%] top-[15%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.14)_0%,transparent_70%)] opacity-50" />
    <div class="absolute right-[15%] top-[55%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.09)_0%,transparent_70%)] opacity-40" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:px-20">
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2 rounded-full border border-orange-500/35 bg-orange-500/15 px-4 py-1.5">
          <span class="text-xs text-orange-400">&#10022;</span>
          <span class="text-xs font-semibold tracking-[2px] text-orange-400">NOTRE PARCOURS</span>
        </div>
        <h2 class="text-center text-[42px] font-extrabold text-slate-50">L'histoire de PULSE</h2>
        <p class="text-center text-base text-slate-400">De l'idee a la realite, chaque etape nous rapproche de notre vision.</p>
      </div>

      <div class="flex w-full max-w-[900px] gap-0">
        <div class="hidden flex-col items-center md:flex" style="width: 40px;">
          <template v-for="(m, i) in milestones" :key="m.title">
            <div class="flex h-4 w-4 items-center justify-center rounded-full shadow-[0_0_0_3px] ring-0" :class="[m.dotColor, m.dotGlow]" />
            <div v-if="i < milestones.length - 1" class="w-0.5 flex-1 bg-gradient-to-b" :class="i % 2 === 0 ? 'from-violet-600 to-orange-500' : 'from-orange-500 to-violet-600'" />
          </template>
        </div>

        <div class="flex flex-1 flex-col gap-6 md:pl-6">
          <div
            v-for="m in milestones"
            :key="m.title"
            class="rounded-xl border bg-pulse-surface/60 p-6"
            :class="m.borderColor"
          >
            <span class="text-sm font-bold tracking-[1px]" :class="m.dateColor">{{ m.date }}</span>
            <h3 class="mt-2 text-xl font-bold text-slate-50">{{ m.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-400">{{ m.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
