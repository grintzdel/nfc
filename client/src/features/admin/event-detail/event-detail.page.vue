<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { useGetEventById } from '@/modules/event/ui/hooks/queries/query/use-get-event-by-id'

const route = useRoute()
const router = useRouter()

const eventId = ref<string | null>((route.params.eventId as string) ?? null)
watch(
  () => route.params.eventId,
  (id) => {
    eventId.value = typeof id === 'string' ? id : null
  },
)

const { data: event, isError } = useGetEventById(eventId)

watch(isError, (err) => {
  if (err) {
    toast.error("Événement introuvable")
    router.push('/admin/events')
  }
})

const title = computed(() => event.value?.name ?? 'Événement')
const subtitle = computed(() => {
  if (!event.value) return undefined
  const start = new Date(event.value.startsAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${event.value.venueName} — ${start}`
})

const activeTab = ref<'participants' | 'bracelets' | 'check-ins'>('participants')
</script>

<template>
  <AdminLayout :title="title" :subtitle="subtitle">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div v-if="!event" class="rounded-lg border border-white/10 bg-[#0F172A] p-6 text-sm text-slate-400">
        Chargement…
      </div>

      <template v-else>
        <!-- Phase 1 will mount <EventDetailHeader :event :stats /> here -->
        <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6 text-sm text-slate-400">
          Header KPI strip à venir (Phase 1)
        </div>

        <Tabs v-model="activeTab" default-value="participants">
          <TabsList>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="bracelets">Bracelets</TabsTrigger>
            <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
          </TabsList>
          <TabsContent value="participants">
            <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6 text-sm text-slate-400">
              Tab Participants — à implémenter (Phase 2)
            </div>
          </TabsContent>
          <TabsContent value="bracelets">
            <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6 text-sm text-slate-400">
              Tab Bracelets — à implémenter (Phase 3)
            </div>
          </TabsContent>
          <TabsContent value="check-ins">
            <div class="rounded-lg border border-white/10 bg-[#0F172A] p-6 text-sm text-slate-400">
              Tab Check-ins — à implémenter (Phase 4)
            </div>
          </TabsContent>
        </Tabs>
      </template>
    </div>
  </AdminLayout>
</template>
