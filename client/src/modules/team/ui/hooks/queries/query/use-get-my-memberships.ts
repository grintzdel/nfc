import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyMemberships() {
  const { teamPort } = useDependencies()

  return useQuery({
    queryKey: ['team', 'my'],
    queryFn: () => teamPort.getMyMemberships(),
  })
}
