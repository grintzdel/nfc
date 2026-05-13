import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetEventDetailStats(eventId: Ref<string | null>) {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'event', eventId],
    queryFn: () => analyticsPort.getEventDetailStats(eventId.value!),
    enabled: () => !!eventId.value,
  })
}
