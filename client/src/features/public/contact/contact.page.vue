<script setup lang="ts">
import { useHead } from '@unhead/vue'

import ContactCta from './components/contact-cta.vue'
import ContactFormSection from './components/contact-form-section.vue'
import ContactHero from './components/contact-hero.vue'
import FaqSection from './components/faq-section.vue'

useHead({
  title: 'Contact — PULSE Event Pass',
  meta: [
    {
      name: 'description',
      content: 'Une question, un projet ? Contactez l’équipe PULSE pour discuter de votre prochain événement.',
    },
  ],
})
</script>

<template>
  <div>
    <ContactHero />
    <ContactFormSection />
    <FaqSection />
    <ContactCta />
  </div>
</template>
