import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyParticipations() {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'my'],
    queryFn: () => participantPort.getMyParticipations(),
  })
}
