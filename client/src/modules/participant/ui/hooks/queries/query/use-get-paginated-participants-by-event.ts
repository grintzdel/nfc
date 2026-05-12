import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedParticipantsByEvent(params: {
  eventId: Ref<string | null>
  page: Ref<number>
  limit: Ref<number>
  search: Ref<string>
  enabled: Ref<boolean>
}) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'event', params.eventId, 'paginated', params.page, params.limit, params.search],
    queryFn: () => participantPort.getPaginatedByEvent({
      eventId: params.eventId.value!,
      page: params.page.value,
      limit: params.limit.value,
      search: params.search.value,
    }),
    enabled: () => Boolean(params.eventId.value) && params.enabled.value,
  })
}
