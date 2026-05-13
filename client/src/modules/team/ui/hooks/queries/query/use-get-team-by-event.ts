import { useQuery } from '@tanstack/vue-query'
import type { Ref } from 'vue'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetTeamByEvent(eventId: Ref<string>) {
  const { teamPort } = useDependencies()

  return useQuery({
    queryKey: ['team', 'event', eventId],
    queryFn: () => teamPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
