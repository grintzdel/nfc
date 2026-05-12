<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import AdminLayout from '@/ui/layout/admin-layout.vue'
import EventStats from './components/event-stats.vue'
import EventTable from './components/event-table.vue'
import EventEditModal from './components/event-edit-modal.vue'
import EventCreateModal from './components/event-create-modal.vue'
import { useGetEventPageStats } from '@/modules/analytics/ui/hooks/queries/query/use-get-event-page-stats'
import { useGetPaginatedEvents } from '@/modules/event/ui/hooks/queries/query/use-get-paginated-events'
import { useGetEventById } from '@/modules/event/ui/hooks/queries/query/use-get-event-by-id'
import { useCreateEvent } from '@/modules/event/ui/hooks/queries/mutation/use-create-event'
import { useUpdateEvent } from '@/modules/event/ui/hooks/queries/mutation/use-update-event'
import { useDeleteEvent } from '@/modules/event/ui/hooks/queries/mutation/use-delete-event'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

const router = useRouter()

const page = ref(1)
const limit = ref(8)
const search = ref('')
const status = ref('')

const { data: stats } = useGetEventPageStats()
const { data: paginatedEvents } = useGetPaginatedEvents({ page, limit, search, status })

const queryClient = useQueryClient()
const createMutation = useCreateEvent()
const updateMutation = useUpdateEvent()
const deleteMutation = useDeleteEvent()

function handleView(id: string) {
  router.push(`/admin/events/${id}`)
}

const editOpen = ref(false)
const editEventId = ref<string | null>(null)
const { data: editEvent } = useGetEventById(editEventId)

function handleEdit(id: string) {
  editEventId.value = id
  editOpen.value = true
}

function handleSave(dto: EventDomainModel.UpdateEventDto) {
  if (!editEventId.value) return
  updateMutation.mutate(
    { id: editEventId.value, dto },
    {
      onSuccess: () => {
        editOpen.value = false
        queryClient.invalidateQueries({ queryKey: ['events'] })
        queryClient.invalidateQueries({ queryKey: ['analytics', 'eventPageStats'] })
      },
    },
  )
}

function handleDelete(id: string) {
  if (!confirm('Supprimer cet evenement ?')) return
  deleteMutation.mutate(id, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'eventPageStats'] })
    },
  })
}

const createOpen = ref(false)

function handleCreate() {
  createOpen.value = true
}

function handleCreateConfirm(dto: EventDomainModel.CreateEventDto) {
  createMutation.mutate(dto, {
    onSuccess: (created) => {
      toast.success('Événement créé')
      createOpen.value = false
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'eventPageStats'] })
      router.push(`/admin/events/${created.id}`)
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la création'),
  })
}

function handleStatusChange(newStatus: string) {
  status.value = newStatus
  page.value = 1
}

function handleSearchChange(newSearch: string) {
  search.value = newSearch
  page.value = 1
}
</script>

<template>
  <AdminLayout title="Evenements" subtitle="Gerer tous vos evenements">
    <div class="flex flex-col gap-6 p-6 xl:p-8">
      <EventStats :data="stats" />

      <EventTable
        :data="paginatedEvents"
        :current-status="status"
        :search="search"
        @update:search="handleSearchChange"
        @update:status="handleStatusChange"
        @update:page="page = $event"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @create="handleCreate"
      />
    </div>

    <EventEditModal
      :event="editEvent ?? null"
      :open="editOpen"
      :loading="updateMutation.isPending.value"
      @close="editOpen = false"
      @save="handleSave"
    />

    <EventCreateModal
      :open="createOpen"
      :loading="createMutation.isPending.value"
      @update:open="(v) => createOpen = v"
      @confirm="handleCreateConfirm"
    />
  </AdminLayout>
</template>
