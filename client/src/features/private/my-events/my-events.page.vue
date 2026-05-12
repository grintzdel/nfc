<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Calendar, MapPin, Pencil, ExternalLink, ShoppingBag } from 'lucide-vue-next'
import { Card, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import { CardSkeleton } from '@/ui/skeleton'
import { useGetMyParticipations } from '@/modules/participant/ui/hooks/queries/query/use-get-my-participations'
import { EventStatus } from '@/modules/event/core/model/event.domain-model'

const { data, isLoading, isError } = useGetMyParticipations()

const participations = computed(() => data.value ?? [])

const STATUS_LABEL: Record<string, string> = {
  [EventStatus.DRAFT]: 'Brouillon',
  [EventStatus.UPCOMING]: 'À venir',
  [EventStatus.IN_PROGRESS]: 'En cours',
  [EventStatus.COMPLETED]: 'Terminé',
  [EventStatus.CANCELLED]: 'Annulé',
}

const STATUS_CLASS: Record<string, string> = {
  [EventStatus.DRAFT]: 'bg-slate-500/20 text-slate-300',
  [EventStatus.UPCOMING]: 'bg-orange-500/20 text-orange-300',
  [EventStatus.IN_PROGRESS]: 'bg-emerald-500/20 text-emerald-300',
  [EventStatus.COMPLETED]: 'bg-slate-500/20 text-slate-300',
  [EventStatus.CANCELLED]: 'bg-red-500/20 text-red-300',
}

function formatDateRange(startsAt: string, endsAt: string): string {
  const fmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  return start.toDateString() === end.toDateString()
    ? fmt.format(start)
    : `${fmt.format(start)} → ${fmt.format(end)}`
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10 lg:py-16">
      <header class="mb-8 flex flex-col gap-2">
        <h1 class="text-3xl font-bold text-slate-50">Mes événements</h1>
        <p class="text-sm text-slate-400">Retrouvez ici tous les événements auxquels vous êtes inscrit.</p>
      </header>

      <CardSkeleton v-if="isLoading" :count="6" />

      <div
        v-else-if="isError"
        class="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200"
      >
        Impossible de charger vos événements. Réessayez dans un instant.
      </div>

      <!-- Empty state -->
      <Card v-else-if="participations.length === 0" class="border-white/10 bg-[#0F172A]">
        <CardContent class="flex flex-col items-center gap-4 py-12 text-center">
          <Calendar class="h-12 w-12 text-slate-500" />
          <div class="flex flex-col gap-1">
            <h2 class="text-lg font-semibold text-slate-50">Aucune inscription pour le moment</h2>
            <p class="text-sm text-slate-400">Explorez les événements disponibles ou commandez votre bracelet Pulse.</p>
          </div>
          <RouterLink to="/shop">
            <Button>
              <ShoppingBag class="mr-2 h-4 w-4" />
              Voir la boutique
            </Button>
          </RouterLink>
        </CardContent>
      </Card>

      <!-- Grid of participations -->
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card
          v-for="p in participations"
          :key="p.id"
          class="flex flex-col gap-4 border-white/10 bg-[#0F172A] transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
        >
          <CardContent class="flex flex-1 flex-col gap-3 p-5">
            <!-- Event header -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-col gap-0.5">
                <h2 class="text-lg font-semibold text-slate-50">
                  {{ p.event?.name ?? 'Événement supprimé' }}
                </h2>
                <span class="text-xs text-slate-400">
                  Inscrit le
                  {{ new Date(p.registeredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </span>
              </div>
              <span
                v-if="p.event"
                class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="STATUS_CLASS[p.event.status]"
              >
                {{ STATUS_LABEL[p.event.status] }}
              </span>
            </div>

            <!-- Event meta -->
            <div v-if="p.event" class="flex flex-col gap-1.5 text-sm text-slate-300">
              <span class="inline-flex items-center gap-1.5">
                <Calendar class="h-3.5 w-3.5 text-slate-500" />
                {{ formatDateRange(p.event.startsAt, p.event.endsAt) }}
              </span>
              <span class="inline-flex items-center gap-1.5">
                <MapPin class="h-3.5 w-3.5 text-slate-500" />
                {{ p.event.venueName }} — {{ p.event.city }}
              </span>
            </div>

            <!-- Bracelet status -->
            <div class="flex items-center gap-2 rounded-md border border-white/10 bg-[#020617] px-3 py-2 text-xs">
              <span class="text-slate-500">Bracelet :</span>
              <span v-if="p.braceletId" class="font-medium text-emerald-300">attaché</span>
              <span v-else class="font-medium text-slate-400">non attribué</span>
            </div>

            <!-- Actions -->
            <div class="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <RouterLink :to="`/me/events/${p.id}`" class="flex-1">
                <Button variant="default" class="w-full">
                  <Pencil class="mr-2 h-3.5 w-3.5" />
                  Modifier mon profil
                </Button>
              </RouterLink>
              <RouterLink
                v-if="p.event"
                :to="`/events/${p.event.slug}`"
                target="_blank"
                rel="noopener"
              >
                <Button variant="outline" size="icon" aria-label="Page publique">
                  <ExternalLink class="h-3.5 w-3.5" />
                </Button>
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </div>
  </div>
</template>
