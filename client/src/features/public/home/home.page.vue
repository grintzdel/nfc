<script setup lang="ts">
import { useHead } from '@unhead/vue'
import HeroSection from './components/hero-section.vue'
import TrustStrip from './components/trust-strip.vue'
import ProblemSolution from './components/problem-solution.vue'
import FeaturesSection from './components/features-section.vue'
import StatsSection from './components/stats-section.vue'
import DashboardPreview from './components/dashboard-preview.vue'
import FinalCta from './components/final-cta.vue'
import FadeInOnScroll from '@/components/fade-in-on-scroll.vue'

useHead({
  title: 'PULSE Event Pass — Bracelets NFC pour festivals et événements',
  meta: [
    {
      name: 'description',
      content:
        'PULSE transforme chaque bracelet NFC en passeport intelligent : un tap pour entrer, un tap pour connecter, un tap pour vivre l’expérience.',
    },
    { property: 'og:title', content: 'PULSE Event Pass — Festivals · Concerts · Soirées' },
    { property: 'og:type', content: 'website' },
    { property: 'og:description', content: 'Plateforme NFC tout-en-un pour organisateurs d’événements.' },
  ],
})
</script>

<template>
  <div>
    <HeroSection />

    <FadeInOnScroll><TrustStrip /></FadeInOnScroll>
    <FadeInOnScroll><ProblemSolution /></FadeInOnScroll>
    <FadeInOnScroll><FeaturesSection /></FadeInOnScroll>
    <FadeInOnScroll><StatsSection /></FadeInOnScroll>
    <FadeInOnScroll><DashboardPreview /></FadeInOnScroll>
    <FadeInOnScroll><FinalCta /></FadeInOnScroll>
  </div>
</template>
