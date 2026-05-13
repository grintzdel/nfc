import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetPaginatedBracelets(params: {
  page: Ref<number>
  limit: Ref<number>
  status: Ref<string>
  search: Ref<string>
}) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', 'paginated', params.page, params.limit, params.status, params.search],
    queryFn: () =>
      braceletPort.getPaginated({
        page: params.page.value,
        limit: params.limit.value,
        status: params.status.value || undefined,
        search: params.search.value,
      }),
  })
}
