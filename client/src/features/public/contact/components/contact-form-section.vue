<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Phone, MapPin } from 'lucide-vue-next'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const infoCards = [
  {
    icon: Mail,
    iconBg: 'bg-gradient-to-br from-violet-600/20 to-violet-600/5',
    iconBorder: 'border-violet-500/25',
    iconColor: 'text-violet-400',
    shadowColor: 'shadow-violet-600/8',
    gradientBg: 'from-violet-600/3 to-transparent',
    title: 'Email',
    value: 'contact@pulse-events.com',
  },
  {
    icon: Phone,
    iconBg: 'bg-gradient-to-br from-orange-500/20 to-orange-500/5',
    iconBorder: 'border-orange-500/25',
    iconColor: 'text-orange-400',
    shadowColor: 'shadow-orange-500/8',
    gradientBg: 'from-orange-500/3 to-transparent',
    title: 'Telephone',
    value: '+33 1 23 45 67 89',
  },
  {
    icon: MapPin,
    iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-500/5',
    iconBorder: 'border-blue-500/25',
    iconColor: 'text-blue-400',
    shadowColor: 'shadow-blue-500/8',
    gradientBg: 'from-blue-500/3 to-transparent',
    title: 'Adresse',
    value: '42 Rue de la Tech, 75011 Paris',
  },
]

function handleSubmit() {
  // placeholder
}
</script>

<template>
  <section class="bg-pulse-bg">
    <div class="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 lg:flex-row lg:px-20">
      <!-- Form -->
      <div class="w-full lg:w-1/2">
        <div class="rounded-2xl border bg-pulse-surface p-8" style="border-image: linear-gradient(135deg, #7C3AED40, #F9731620, #7C3AED10) 1;">
          <h2 class="mb-6 text-2xl font-bold text-slate-50">Envoyez-nous un message</h2>

          <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Nom</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Votre nom"
                class="rounded-md border border-slate-700 bg-pulse-bg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-violet-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="votre@email.com"
                class="rounded-md border border-slate-700 bg-pulse-bg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-violet-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Sujet</label>
              <input
                v-model="form.subject"
                type="text"
                placeholder="De quoi souhaitez-vous parler ?"
                class="rounded-md border border-slate-700 bg-pulse-bg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-violet-500"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-300">Message</label>
              <textarea
                v-model="form.message"
                rows="5"
                placeholder="Votre message..."
                class="resize-none rounded-md border border-slate-700 bg-pulse-bg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              class="w-full rounded-md bg-pulse-violet px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-pulse-violet-dark hover:shadow-lg hover:shadow-violet-500/25"
            >
              Envoyer le message
            </button>
          </form>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="flex w-full flex-col gap-5 lg:w-1/2">
        <div
          v-for="card in infoCards"
          :key="card.title"
          class="flex items-center gap-4 rounded-xl border border-slate-700 bg-pulse-surface p-6"
          :class="`shadow-[0_4px_30px] ${card.shadowColor}`"
        >
          <div
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border"
            :class="[card.iconBg, card.iconBorder]"
          >
            <component :is="card.icon" class="h-5 w-5" :class="card.iconColor" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-50">{{ card.title }}</h3>
            <p class="text-sm text-slate-400">{{ card.value }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
