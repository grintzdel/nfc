import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetCheckInsByEvent(eventId: Ref<string>) {
  const { checkInPort } = useDependencies()

  return useQuery({
    queryKey: ['checkIns', 'event', eventId],
    queryFn: () => checkInPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
