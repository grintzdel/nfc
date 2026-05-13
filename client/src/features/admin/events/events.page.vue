<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import { useGetEventPageStats } from '@/modules/analytics/ui/hooks/queries/query/use-get-event-page-stats'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import { useCreateEvent } from '@/modules/event/ui/hooks/queries/mutation/use-create-event'
import { useDeleteEvent } from '@/modules/event/ui/hooks/queries/mutation/use-delete-event'
import type { EventStatusAction } from '@/modules/event/ui/hooks/queries/mutation/use-event-status-transition'
import { useEventStatusTransition } from '@/modules/event/ui/hooks/queries/mutation/use-event-status-transition'
import { useUpdateEvent } from '@/modules/event/ui/hooks/queries/mutation/use-update-event'
import { useGetEventById } from '@/modules/event/ui/hooks/queries/query/use-get-event-by-id'
import { useGetPaginatedEvents } from '@/modules/event/ui/hooks/queries/query/use-get-paginated-events'
import AdminLayout from '@/ui/layout/admin-layout.vue'

import ConfirmDeleteEventDialog from './components/confirm-delete-event-dialog.vue'
import EventCreateModal from './components/event-create-modal.vue'
import EventEditModal from './components/event-edit-modal.vue'
import EventStats from './components/event-stats.vue'
import EventTable from './components/event-table.vue'

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
const statusTransitionMutation = useEventStatusTransition()

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
    }
  )
}

function handleStatusAction(action: EventStatusAction) {
  if (!editEventId.value) return
  statusTransitionMutation.mutate({ id: editEventId.value, action })
}

const deleteOpen = ref(false)
const deleteEventId = ref<string | null>(null)
const deleteEventName = computed(() => paginatedEvents.value?.items.find((e) => e.id === deleteEventId.value)?.name)

function handleDelete(id: string) {
  deleteEventId.value = id
  deleteOpen.value = true
}

function handleConfirmDelete() {
  if (!deleteEventId.value) return
  deleteMutation.mutate(deleteEventId.value, {
    onSuccess: () => {
      toast.success('Événement supprimé')
      deleteOpen.value = false
      deleteEventId.value = null
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'eventPageStats'] })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Erreur lors de la suppression'),
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
      :status-loading="statusTransitionMutation.isPending.value"
      @close="editOpen = false"
      @save="handleSave"
      @status-action="handleStatusAction"
    />

    <EventCreateModal
      :open="createOpen"
      :loading="createMutation.isPending.value"
      @update:open="(v) => (createOpen = v)"
      @confirm="handleCreateConfirm"
    />

    <ConfirmDeleteEventDialog
      :open="deleteOpen"
      :event-name="deleteEventName"
      :loading="deleteMutation.isPending.value"
      @update:open="(v) => (deleteOpen = v)"
      @confirm="handleConfirmDelete"
    />
  </AdminLayout>
</template>
