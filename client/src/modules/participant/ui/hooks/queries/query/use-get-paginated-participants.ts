import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedParticipants(params: {
  page: Ref<number>
  limit: Ref<number>
  checkedIn: Ref<boolean | undefined>
  search: Ref<string>
}) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'paginated', params.page, params.limit, params.checkedIn, params.search],
    queryFn: () =>
      participantPort.getPaginated({
        page: params.page.value,
        limit: params.limit.value,
        checkedIn: params.checkedIn.value,
        search: params.search.value,
      }),
  })
}
