import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllBracelets(status?: Ref<string | undefined>) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', status],
    queryFn: () => braceletPort.getAll(status?.value),
  })
}
