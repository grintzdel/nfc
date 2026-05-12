import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetStock() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'stock'],
    queryFn: () => analyticsPort.getStock(),
  })
}
