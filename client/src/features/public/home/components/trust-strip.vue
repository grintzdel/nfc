<template>
  <section class="border-t border-violet-500/20 bg-gradient-to-b from-pulse-bg via-[#1a0a2e] to-pulse-bg">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12 lg:px-20">
      <p class="text-sm font-semibold tracking-[2px] text-slate-400">
        ILS VIBRENT AVEC PULSE
      </p>
      <div class="flex w-full flex-wrap items-center justify-center gap-10 lg:gap-16">
        <span
          v-for="name in ['TOMORROWLAND', 'LOLLAPALOOZA', 'ROCK EN SEINE', 'SOLIDAYS', 'GAROROCK', 'COACHELLA']"
          :key="name"
          class="text-lg font-bold tracking-[3px] text-violet-400/70"
        >
          {{ name }}
        </span>
      </div>
    </div>
  </section>
</template>
