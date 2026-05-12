<template>
  <section class="bg-pulse-bg">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-16 lg:flex-row lg:px-20">
      <!-- Image -->
      <div class="relative w-full lg:w-1/2">
        <div class="absolute -left-[50px] -top-[50px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.35)_0%,transparent_70%)] opacity-50" />
        <div class="aspect-[4/5] overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-pulse-surface to-pulse-bg">
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <div class="mb-4 text-7xl">🎵</div>
              <p class="text-lg font-semibold text-slate-300">L'equipe PULSE</p>
              <p class="text-sm text-slate-500">En festival, evidemment</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex w-full flex-col justify-center gap-6 lg:w-1/2">
        <div class="flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-600/15 px-4 py-1.5 w-fit">
          <span class="text-xs text-violet-400">&#10022;</span>
          <span class="text-xs font-semibold tracking-[2px] text-violet-400">NOTRE MISSION</span>
        </div>

        <h2 class="text-5xl font-extrabold leading-[1.1] text-slate-50">
          Reconnecter<br>le monde reel
        </h2>

        <p class="text-base leading-[1.7] text-slate-400">
          PULSE fait le pont entre les experiences physiques et numeriques lors des evenements, rendant chaque interaction fluide grace a la technologie NFC.
        </p>
        <p class="text-base leading-[1.7] text-slate-400">
          Notre mission : supprimer les frictions pour que les gens se concentrent sur ce qui compte vraiment — vivre l'instant present.
        </p>

        <div class="h-1 w-[60px] rounded-sm bg-gradient-to-r from-violet-600 to-orange-500" />
      </div>
    </div>
  </section>
</template>
