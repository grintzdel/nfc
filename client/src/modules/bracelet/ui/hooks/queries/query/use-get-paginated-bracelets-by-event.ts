import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedBraceletsByEvent(params: {
  eventId: Ref<string | null>
  page: Ref<number>
  limit: Ref<number>
  search: Ref<string>
  enabled: Ref<boolean>
}) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', 'event', params.eventId, 'paginated', params.page, params.limit, params.search],
    queryFn: () =>
      braceletPort.getPaginatedByEvent({
        eventId: params.eventId.value!,
        page: params.page.value,
        limit: params.limit.value,
        search: params.search.value,
      }),
    enabled: () => Boolean(params.eventId.value) && params.enabled.value,
  })
}
