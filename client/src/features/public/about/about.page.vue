<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AboutHero from './components/about-hero.vue'
import MissionSection from './components/mission-section.vue'
import TimelineSection from './components/timeline-section.vue'
import ValuesSection from './components/values-section.vue'
import AboutStats from './components/about-stats.vue'
import AboutCta from './components/about-cta.vue'

useHead({
  title: 'À propos — PULSE Event Pass',
  meta: [{ name: 'description', content: 'L’histoire et la mission de PULSE : connecter le monde physique et digital pour les événements de demain.' }],
})
</script>

<template>
  <div>
    <AboutHero />
    <MissionSection />
    <TimelineSection />
    <ValuesSection />
    <AboutStats />
    <AboutCta />
  </div>
</template>
