<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGetEventPublicBySlug } from '@/modules/event/ui/hooks/queries/query/use-get-event-public-by-slug'
import EventPublicHero from '@/modules/event/ui/components/event-public-hero.vue'
import EventPublicDescription from '@/modules/event/ui/components/event-public-description.vue'
import EventNotAvailable from '@/modules/event/ui/components/event-not-available.vue'
import EventRegistrationForm from '@/modules/event/ui/components/event-registration-form.vue'
import { Card, CardContent } from '@/ui/card'

const route = useRoute()
const slug = ref<string | null>(typeof route.params.slug === 'string' ? route.params.slug : null)
watch(
  () => route.params.slug,
  (s) => {
    slug.value = typeof s === 'string' ? s : null
  },
)

const { data, isLoading, isError } = useGetEventPublicBySlug(slug)
</script>

<template>
  <div class="min-h-screen bg-background px-6 py-10 lg:px-20">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <Card v-if="isLoading">
        <CardContent class="p-6 text-center text-muted-foreground">Chargement…</CardContent>
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
          <EventRegistrationForm :event-id="data.id" />
        </div>
      </template>
    </div>
  </div>
</template>
