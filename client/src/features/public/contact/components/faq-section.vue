<script setup lang="ts">
const faqLeft = [
  {
    bgGradient: 'from-pulse-surface to-[#1a1040]',
    question: 'Combien coute un bracelet PULSE ?',
    answer: 'Les packs demarrent a partir de 2,50€ par bracelet pour les commandes de +500 unites. Contactez-nous pour un devis personnalise adapte a la taille de votre evenement.',
  },
  {
    bgGradient: 'from-pulse-surface to-[#1f1a2a]',
    question: 'Quel est le delai de livraison ?',
    answer: 'Les bracelets sont livres sous 5 jours ouvrables en France metropolitaine. Pour les commandes urgentes, nous proposons une option express 48h.',
  },
  {
    bgGradient: 'from-pulse-surface to-[#162030]',
    question: 'Les bracelets sont-ils reutilisables ?',
    answer: 'Oui ! Les bracelets PULSE sont concus pour etre reprogrammes et reutilises sur plusieurs evenements, reduisant les couts et l\'impact environnemental.',
  },
]

const faqRight = [
  {
    bgGradient: 'from-pulse-surface to-[#1a1535]',
    question: 'Faut-il une app pour les participants ?',
    answer: 'Non ! C\'est tout l\'interet de PULSE. Le bracelet NFC fonctionne sans application, sans batterie et sans connexion internet du cote participant.',
  },
  {
    bgGradient: 'from-pulse-surface to-[#1a2030]',
    question: 'Comment configurer les bracelets ?',
    answer: 'Tout se fait depuis le dashboard PULSE. Creez votre evenement, definissez les interactions et assignez les bracelets en quelques clics. Aucune competence technique requise.',
  },
  {
    bgGradient: 'from-pulse-surface to-[#172030]',
    question: 'Proposez-vous un accompagnement ?',
    answer: 'Absolument. Notre equipe vous accompagne de A a Z : configuration, formation de vos equipes sur place, et support technique le jour J.',
  },
]
</script>

<template>
  <section class="relative bg-pulse-bg">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,58,237,0.04)_0%,transparent_70%)]" />

    <div class="relative mx-auto flex max-w-7xl flex-col items-center gap-14 px-6 py-24 lg:px-20">
      <div class="rounded-full border border-slate-600 px-3 py-0.5">
        <span class="text-xs font-semibold text-slate-800">FAQ</span>
      </div>

      <h2 class="bg-gradient-to-b from-slate-50 to-violet-400 bg-clip-text text-center text-4xl font-bold text-transparent">
        Questions frequentes
      </h2>

      <p class="max-w-[600px] text-center text-lg leading-relaxed text-slate-400">
        Tout ce que vous devez savoir avant de nous contacter.
      </p>

      <div class="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
        <div class="flex flex-col gap-5">
          <div
            v-for="faq in faqLeft"
            :key="faq.question"
            class="rounded-xl border border-slate-700 p-6"
            :class="`bg-gradient-to-b ${faq.bgGradient}`"
          >
            <h3 class="mb-3 text-base font-semibold text-slate-50">{{ faq.question }}</h3>
            <p class="text-sm leading-relaxed text-slate-400">{{ faq.answer }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <div
            v-for="faq in faqRight"
            :key="faq.question"
            class="rounded-xl border border-slate-700 p-6"
            :class="`bg-gradient-to-b ${faq.bgGradient}`"
          >
            <h3 class="mb-3 text-base font-semibold text-slate-50">{{ faq.question }}</h3>
            <p class="text-sm leading-relaxed text-slate-400">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
