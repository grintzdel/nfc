import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetEventById(id: Ref<string | null>) {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventPort.getById(id.value!),
    enabled: () => !!id.value,
  })
}
