import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantsCount() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'participantsCount'],
    queryFn: () => analyticsPort.getParticipantsCount(),
  })
}
