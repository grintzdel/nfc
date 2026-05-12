import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetActiveEvents() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'activeEvents'],
    queryFn: () => analyticsPort.getActiveEvents(),
  })
}
