<script setup lang="ts">
import { useHead } from '@unhead/vue'

import FeatureTapConnect from './components/feature-tap-connect.vue'
import FeatureTapGo from './components/feature-tap-go.vue'
import FeatureTapInteract from './components/feature-tap-interact.vue'
import FeaturesCta from './components/features-cta.vue'
import FeaturesHero from './components/features-hero.vue'
import HowItWorks from './components/how-it-works.vue'
import OrganizerSection from './components/organizer-section.vue'

useHead({
  title: 'Fonctionnalités — PULSE Event Pass',
  meta: [
    {
      name: 'description',
      content: 'Tap & Go, Tap & Connect, Tap & Interact : trois usages NFC pour transformer vos événements.',
    },
  ],
})
</script>

<template>
  <div>
    <FeaturesHero />
    <FeatureTapGo />
    <FeatureTapConnect />
    <FeatureTapInteract />
    <OrganizerSection />
    <HowItWorks />
    <FeaturesCta />
  </div>
</template>
