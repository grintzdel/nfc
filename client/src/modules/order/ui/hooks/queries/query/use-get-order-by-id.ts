import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetOrderById(id: Ref<string>) {
  const { orderPort } = useDependencies()

  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
