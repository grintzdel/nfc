<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGetEventPublicBySlug } from '@/modules/event/ui/hooks/queries/query/use-get-event-public-by-slug'
import EventPublicHero from '@/modules/event/ui/components/event-public-hero.vue'
import EventPublicDescription from '@/modules/event/ui/components/event-public-description.vue'
import EventNotAvailable from '@/modules/event/ui/components/event-not-available.vue'
import EventRegistrationForm from '@/modules/event/ui/components/event-registration-form.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Skeleton } from '@/ui/skeleton'
import { Users } from 'lucide-vue-next'

const route = useRoute()
const slug = ref<string | null>(typeof route.params.slug === 'string' ? route.params.slug : null)
watch(
  () => route.params.slug,
  (s) => {
    slug.value = typeof s === 'string' ? s : null
  },
)

const { data, isLoading, isError } = useGetEventPublicBySlug(slug)

const isFull = computed(() => {
  if (!data.value) return false
  return data.value.capacity > 0 && (data.value.participantCount ?? 0) >= data.value.capacity
})

const fillPercent = computed(() => {
  if (!data.value || data.value.capacity === 0) return 0
  return Math.min(100, Math.round(((data.value.participantCount ?? 0) / data.value.capacity) * 100))
})
</script>

<template>
  <div class="min-h-screen bg-background px-6 py-10 lg:px-20">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card v-if="isLoading">
        <CardContent class="flex flex-col gap-4 p-6">
          <Skeleton class="h-8 w-2/3" />
          <Skeleton class="h-4 w-1/2" />
          <div class="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-2">
            <Skeleton class="h-32 w-full" />
            <Skeleton class="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
      <EventNotAvailable v-else-if="isError || !data" />
      <template v-else>
        <EventPublicHero
          :name="data.name"
          :starts-at="data.startsAt"
          :ends-at="data.endsAt"
          :city="data.city"
          :venue-name="data.venueName"
        />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EventPublicDescription :description="data.description" />

          <Card v-if="isFull" class="border-amber-500/30 bg-amber-500/10">
            <CardHeader>
              <CardTitle class="flex items-center gap-2 text-amber-300">
                <Users class="h-4 w-4" />
                Événement complet
              </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-3 text-sm text-amber-100">
              <p>
                Cet événement a atteint sa capacité maximale de {{ data.capacity }} participants.
                Les inscriptions sont fermées.
              </p>
              <p class="text-xs text-amber-200/80">
                Revenez plus tard, des places peuvent se libérer.
              </p>
            </CardContent>
          </Card>

          <div v-else class="flex flex-col gap-3">
            <div
              v-if="data.capacity > 0"
              class="flex items-center gap-2 rounded-md border border-white/10 bg-slate-900/40 px-3 py-2 text-xs text-slate-300"
            >
              <Users class="h-3.5 w-3.5" />
              {{ data.participantCount ?? 0 }} / {{ data.capacity }} places
              <span class="text-slate-500">({{ fillPercent }}% remplies)</span>
            </div>
            <EventRegistrationForm :event-id="data.id" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
