<script setup lang="ts">
import HeroSection from './components/hero-section.vue'
import TrustStrip from './components/trust-strip.vue'
import ProblemSolution from './components/problem-solution.vue'
import FeaturesSection from './components/features-section.vue'
import StatsSection from './components/stats-section.vue'
import DashboardPreview from './components/dashboard-preview.vue'
import FinalCta from './components/final-cta.vue'
import FadeInOnScroll from '@/components/fade-in-on-scroll.vue'
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
