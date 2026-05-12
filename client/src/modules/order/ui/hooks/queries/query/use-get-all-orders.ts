import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllOrders() {
  const { orderPort } = useDependencies()

  return useQuery({
    queryKey: ['orders', 'admin'],
    queryFn: () => orderPort.getAllAdmin(),
  })
}
