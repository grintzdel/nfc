import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedEvents(params: {
  page: Ref<number>
  limit: Ref<number>
  search: Ref<string>
  status: Ref<string>
}) {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'paginated', params.page, params.limit, params.search, params.status],
    queryFn: () =>
      eventPort.getPaginated({
        page: params.page.value,
        limit: params.limit.value,
        search: params.search.value || undefined,
        status: params.status.value || undefined,
      }),
  })
}
