import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyOrders() {
  const { orderPort } = useDependencies()

  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderPort.getMyOrders(),
  })
}
