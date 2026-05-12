import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetInteractions() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'interactions'],
    queryFn: () => analyticsPort.getInteractions(),
  })
}
