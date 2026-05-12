import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetRevenue() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => analyticsPort.getRevenue(),
  })
}
