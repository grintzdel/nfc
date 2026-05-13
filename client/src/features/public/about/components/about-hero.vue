<template>
  <section class="relative overflow-hidden bg-pulse-bg">
    <div class="absolute inset-0 opacity-40">
      <div
        class="absolute left-[8%] top-[12%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.27)_0%,transparent_70%)] opacity-60"
      />
      <div
        class="absolute right-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.27)_0%,transparent_70%)] opacity-50"
      />
    </div>

    <div class="pointer-events-none absolute inset-0">
      <span class="absolute left-[15%] top-[22%] text-xl text-violet-400/40">&#10024;</span>
      <span class="absolute right-[8%] top-[17%] text-base text-orange-400/30">&#10022;</span>
      <span class="absolute left-[26%] top-[72%] text-sm text-violet-400/35">&#10038;</span>
      <span class="absolute right-[15%] top-[69%] text-lg text-orange-500/30">&#10022;</span>
    </div>

    <div class="relative mx-auto flex h-[700px] max-w-7xl flex-col items-center justify-center gap-7 px-6 lg:px-20">
      <div class="flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-600/15 px-4 py-1.5">
        <span class="text-xs text-violet-400">&#10022;</span>
        <span class="text-xs font-semibold tracking-[2px] text-violet-400">NOTRE HISTOIRE</span>
      </div>

      <h1 class="text-center text-5xl font-extrabold leading-[1.1] text-slate-50 md:text-6xl lg:text-[64px]">
        Ne avec la passion<br />des festivals
      </h1>

      <p class="max-w-[700px] text-center text-lg leading-relaxed text-slate-400">
        PULSE est ne d'un constat simple : les evenements meritent une meilleure technologie. Nous creons des
        experiences connectees qui rapprochent les gens.
      </p>
    </div>
  </section>
</template>
