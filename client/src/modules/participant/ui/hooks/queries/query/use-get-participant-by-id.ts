import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantById(id: Ref<string>) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
