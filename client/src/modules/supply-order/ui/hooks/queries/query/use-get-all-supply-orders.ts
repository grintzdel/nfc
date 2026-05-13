import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllSupplyOrders() {
  const { supplyOrderPort } = useDependencies()

  return useQuery({
    queryKey: ['supplyOrders'],
    queryFn: () => supplyOrderPort.getAll(),
  })
}
