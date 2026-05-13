import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedCheckInsByEvent(params: {
  eventId: Ref<string | null>
  page: Ref<number>
  limit: Ref<number>
  enabled: Ref<boolean>
}) {
  const { checkInPort } = useDependencies()

  return useQuery({
    queryKey: ['checkIns', 'event', params.eventId, 'paginated', params.page, params.limit],
    queryFn: () =>
      checkInPort.getPaginatedByEvent({
        eventId: params.eventId.value!,
        page: params.page.value,
        limit: params.limit.value,
      }),
    enabled: () => Boolean(params.eventId.value) && params.enabled.value,
  })
}
