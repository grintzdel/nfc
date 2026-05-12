import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantsByEvent(eventId: Ref<string>) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'event', eventId],
    queryFn: () => participantPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
