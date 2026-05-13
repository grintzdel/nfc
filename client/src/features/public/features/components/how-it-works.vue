<script setup lang="ts">
const steps = [
  {
    number: '1',
    gradient: 'from-violet-600 to-pink-500',
    bgGradient: 'from-pulse-surface to-[#1a1040]',
    title: 'Commandez vos bracelets',
    description: 'Choisissez votre pack dans le catalogue, personnalisez les couleurs et recevez-les en 5 jours.',
  },
  {
    number: '2',
    gradient: 'from-orange-500 to-orange-400',
    bgGradient: 'from-pulse-surface to-[#1f1a2a]',
    title: 'Configurez votre evenement',
    description: 'Creez votre evenement sur le dashboard, assignez les bracelets et definissez les interactions.',
  },
  {
    number: '3',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-pulse-surface to-[#162030]',
    title: "Vivez l'experience",
    description: 'Le jour J, distribuez les bracelets. Vos participants tappent, se connectent et interagissent.',
  },
]
</script>

<template>
  <section id="how-it-works" class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.04)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <div class="rounded-full border border-slate-600 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-800">COMMENT CA MARCHE</span>
      </div>

      <h2
        class="bg-gradient-to-b from-slate-50 to-violet-400 bg-clip-text text-center text-4xl font-bold text-transparent"
      >
        Simple comme 1, 2, 3
      </h2>

      <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-3">
        <div
          v-for="step in steps"
          :key="step.number"
          class="flex flex-col items-center gap-5 rounded-2xl border border-slate-700 p-8"
          :class="`bg-gradient-to-b ${step.bgGradient}`"
        >
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white"
            :class="`${step.gradient}`"
          >
            {{ step.number }}
          </div>
          <h3 class="text-center text-lg font-semibold text-slate-50">{{ step.title }}</h3>
          <p class="text-center text-sm leading-relaxed text-slate-400">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
