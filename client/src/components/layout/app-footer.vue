<script setup lang="ts">
import { RouterLink } from 'vue-router'

const footerColumns = [
  {
    title: 'PULSE',
    links: [
      { label: 'A propos', href: '#about' },
      { label: 'Fonctionnalites', href: '#features' },
      { label: 'Tarifs', href: '/shop' },
      { label: 'Blog', href: '#blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Centre d\'aide', href: '#help' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: '#contact' },
      { label: 'Status', href: '#status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'CGV', href: '#cgv' },
      { label: 'Confidentialite', href: '#privacy' },
      { label: 'Mentions legales', href: '#legal' },
    ],
  },
]
</script>

<template>
  <footer class="border-t-2 border-gradient-to-r bg-[#0B1120]" style="border-image: linear-gradient(90deg, #7C3AED88, #EC489966, #F9731688) 1;">
    <div class="mx-auto max-w-7xl px-6 py-12 lg:px-20">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <RouterLink to="/" class="text-2xl font-extrabold tracking-[2px] text-slate-50">
            PULSE
          </RouterLink>
          <p class="mt-3 text-sm text-slate-500">
            Ton bracelet NFC intelligent pour vivre chaque evenement a fond.
          </p>
        </div>

        <div v-for="col in footerColumns" :key="col.title">
          <h4 class="mb-3 text-sm font-semibold text-slate-300">{{ col.title }}</h4>
          <ul class="flex flex-col gap-2">
            <li v-for="link in col.links" :key="link.label">
              <a :href="link.href" class="text-sm text-slate-500 transition-colors hover:text-slate-300">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 border-t border-slate-700 pt-8">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p class="text-xs text-slate-500">2026 PULSE. Tous droits reserves.</p>
          <div class="flex items-center gap-2 text-xs text-slate-600">
            <span>Réseaux sociaux</span>
            <span class="rounded-full bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Bientôt
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
