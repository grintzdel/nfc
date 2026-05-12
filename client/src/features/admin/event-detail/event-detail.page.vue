<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Skeleton, TableSkeleton } from '@/ui/skeleton'
import { useGetEventById } from '@/modules/event/ui/hooks/queries/query/use-get-event-by-id'
import { useGetEventDetailStats } from '@/modules/analytics/ui/hooks/queries/query/use-get-event-detail-stats'
import { useEventStatusTransition, type EventStatusAction } from '@/modules/event/ui/hooks/queries/mutation/use-event-status-transition'
import EventDetailHeader from './components/event-detail-header.vue'
import EventDetailParticipants from './components/event-detail-participants.vue'
import EventDetailBracelets from './components/event-detail-bracelets.vue'
import EventDetailCheckIns from './components/event-detail-check-ins.vue'
import EventDetailTeam from './components/event-detail-team.vue'

const route = useRoute()
const router = useRouter()

const eventId = ref<string | null>((route.params.eventId as string) ?? null)
watch(
  () => route.params.eventId,
  (id) => {
    eventId.value = typeof id === 'string' ? id : null
  },
)

const { data: event, isError: eventError } = useGetEventById(eventId)
const { data: stats, isError: statsError } = useGetEventDetailStats(eventId)
const statusMutation = useEventStatusTransition()

watch([eventError, statsError], ([eErr, sErr]) => {
  if (eErr || sErr) {
    toast.error('Événement introuvable')
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

const isReady = computed(() => Boolean(event.value && stats.value))
const activeTab = ref<'participants' | 'bracelets' | 'check-ins' | 'team'>('participants')

function handleStatusAction(action: EventStatusAction): void {
  if (!eventId.value) return
  statusMutation.mutate({ id: eventId.value, action })
}
</script>

<template>
  <AdminLayout :title="title" :subtitle="subtitle">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <div v-if="!isReady" class="flex flex-col gap-6">
        <!-- Header band placeholder -->
        <div class="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0F172A] p-6">
          <Skeleton class="h-6 w-1/3" />
          <Skeleton class="h-4 w-1/2" />
        </div>
        <!-- KPI grid placeholder -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="i in 4"
            :key="i"
            class="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0F172A] p-5"
          >
            <Skeleton class="h-3 w-1/2" />
            <Skeleton class="h-7 w-2/3" />
            <Skeleton class="h-3 w-1/3" />
          </div>
        </div>
        <!-- Table placeholder -->
        <div class="flex flex-col rounded-lg border border-white/10 bg-[#0F172A]">
          <TableSkeleton :rows="5" :columns="5" />
        </div>
      </div>

      <template v-else-if="event && stats">
        <EventDetailHeader
          :event="event"
          :stats="stats"
          :loading="statusMutation.isPending.value"
          @action="handleStatusAction"
        />

        <Tabs v-model="activeTab" default-value="participants">
          <TabsList>
            <TabsTrigger value="participants">
              Participants ({{ stats.participantCount }})
            </TabsTrigger>
            <TabsTrigger value="bracelets">
              Bracelets ({{ stats.braceletsAttachedCount }})
            </TabsTrigger>
            <TabsTrigger value="check-ins">
              Check-ins ({{ stats.checkInCount }})
            </TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
          </TabsList>
          <TabsContent value="participants">
            <EventDetailParticipants :event-id="event.id" />
          </TabsContent>
          <TabsContent value="bracelets">
            <EventDetailBracelets :event-id="event.id" />
          </TabsContent>
          <TabsContent value="check-ins">
            <EventDetailCheckIns :event-id="event.id" :stats="stats" />
          </TabsContent>
          <TabsContent value="team">
            <EventDetailTeam :event-id="event.id" />
          </TabsContent>
        </Tabs>
      </template>
    </div>
  </AdminLayout>
</template>
