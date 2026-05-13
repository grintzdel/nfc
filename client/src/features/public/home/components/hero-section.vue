<script setup lang="ts">
import { CheckCircle2, Nfc, Sparkles } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 bg-pulse-bg">
      <div class="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[100px]" />
      <div class="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-orange-500/10 blur-[80px]" />
      <div class="bg-pink-500/8 absolute right-1/3 top-1/3 h-[300px] w-[400px] rounded-full blur-[100px]" />
    </div>

    <div class="pointer-events-none absolute inset-0">
      <Sparkles class="absolute left-[20%] top-[15%] h-5 w-5 text-violet-400/30" />
      <Sparkles class="absolute left-[15%] top-[40%] h-3.5 w-3.5 text-pink-500/25" />
      <div class="absolute left-[23%] top-[22%] h-1 w-1 rounded-full bg-violet-400/40" />
      <div class="absolute right-[10%] top-[15%] h-0.5 w-0.5 rounded-full bg-orange-500/35" />
      <div
        class="absolute right-[15%] top-[20%] h-[200px] w-[200px] rounded-full border-2 border-violet-600/20 opacity-40 blur-[3px]"
      />
      <div
        class="absolute left-[6%] top-[55%] h-[150px] w-[150px] rounded-full border-2 border-orange-500/15 opacity-30 blur-[3px]"
      />
    </div>

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 pb-24 pt-32 lg:px-20">
      <div
        class="hero-rise rounded-full border border-violet-500/50 bg-gradient-to-r from-violet-600/25 to-pink-500/25 px-4 py-1"
        style="--rise-delay: 0ms"
      >
        <span
          class="bg-gradient-to-b from-violet-200 to-orange-200 bg-clip-text text-xs font-semibold text-transparent"
        >
          Festivals · Concerts · Conferences · Soirees
        </span>
      </div>

      <h1
        class="hero-rise max-w-[900px] bg-gradient-to-b from-slate-50 via-violet-400 to-slate-50 bg-clip-text text-center text-5xl font-extrabold leading-tight text-transparent md:text-6xl lg:text-[64px]"
        style="--rise-delay: 80ms"
      >
        Vibrez. Connectez. Vivez.
      </h1>

      <p
        class="hero-rise max-w-[720px] text-center text-lg leading-relaxed text-slate-400 md:text-xl"
        style="--rise-delay: 160ms"
      >
        PULSE transforme chaque bracelet NFC en passeport intelligent pour vos soirees et festivals. Un tap pour entrer,
        un tap pour se connecter, un tap pour vivre l'experience a fond.
      </p>

      <div class="hero-rise flex items-center gap-4" style="--rise-delay: 240ms">
        <RouterLink
          to="/shop"
          class="rounded-md bg-pulse-violet px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
        >
          Decouvrir les pass
        </RouterLink>
        <a
          href="#features"
          class="rounded-md border border-white/10 bg-slate-950 px-6 py-2.5 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:border-white/20 hover:text-white"
        >
          En savoir plus
        </a>
      </div>

      <div
        class="hero-rise mt-8 w-full max-w-[1000px] overflow-hidden rounded-2xl border border-violet-500/15 shadow-[0_30px_100px_-20px_rgba(124,58,237,0.3),0_0_150px_-30px_rgba(249,115,22,0.13)]"
        style="--rise-delay: 360ms"
      >
        <div class="relative aspect-[2/1] w-full bg-gradient-to-br from-[#1a0f2e] via-pulse-surface to-pulse-bg">
          <div
            class="absolute inset-0 opacity-30"
            style="
              background-image:
                linear-gradient(rgba(124, 58, 237, 0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(124, 58, 237, 0.06) 1px, transparent 1px);
              background-size: 32px 32px;
            "
          />

          <div class="absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" />
          <div class="absolute -right-12 bottom-1/4 h-80 w-80 rounded-full bg-orange-500/25 blur-3xl" />

          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 sm:flex-row sm:gap-16 sm:px-14"
          >
            <div class="relative">
              <div
                class="absolute -inset-6 animate-ping rounded-full border border-violet-400/30 [animation-duration:2.5s]"
              />
              <div
                class="absolute -inset-3 animate-ping rounded-full border border-orange-400/30 [animation-delay:300ms] [animation-duration:2.5s]"
              />
              <div
                class="relative h-20 w-48 -rotate-6 rounded-full bg-gradient-to-br from-violet-500 via-violet-600 to-purple-800 shadow-[0_20px_50px_-10px_rgba(124,58,237,0.6)] sm:h-24 sm:w-56"
              >
                <div
                  class="absolute inset-y-3 left-3 right-3 rounded-full border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
                />
                <span
                  class="absolute left-7 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-[0.25em] text-white/90 sm:text-xs"
                >
                  PULSE
                </span>
                <div
                  class="absolute right-5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-gradient-to-br from-amber-300 via-orange-400 to-orange-600 shadow-inner shadow-amber-200/40 sm:h-12 sm:w-12"
                >
                  <Nfc class="h-5 w-5 text-orange-950 sm:h-6 sm:w-6" />
                </div>
              </div>
            </div>

            <div
              class="relative w-[280px] rounded-2xl border border-white/10 bg-slate-900/85 p-5 shadow-2xl shadow-violet-500/20 backdrop-blur-md sm:w-[300px]"
            >
              <div class="mb-4 flex items-center justify-between">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-violet-300"> Scan en cours </span>
                <span class="relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span
                    class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  />
                </span>
              </div>

              <div class="mb-4 flex items-center gap-3">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-orange-400 text-sm font-semibold text-white shadow-md shadow-violet-500/30"
                >
                  MD
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-semibold text-slate-50">Marie Dubois</span>
                  <span class="text-xs text-slate-400">Speaker · Pulse Demo</span>
                </div>
              </div>

              <div
                class="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300"
              >
                <CheckCircle2 class="h-3.5 w-3.5" />
                Check-in confirmé · 12:42
              </div>
            </div>
          </div>

          <Sparkles class="absolute left-[8%] top-[18%] h-4 w-4 text-violet-300/40" />
          <Sparkles class="absolute bottom-[18%] right-[10%] h-3.5 w-3.5 text-orange-300/40" />
          <div class="absolute right-[18%] top-[12%] h-1 w-1 rounded-full bg-violet-300/60" />
          <div class="absolute bottom-[22%] left-[15%] h-1.5 w-1.5 rounded-full bg-orange-300/50" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-rise {
  opacity: 0;
  transform: translateY(24px);
  animation: hero-rise 720ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--rise-delay, 0ms);
}

@keyframes hero-rise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-rise {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>
