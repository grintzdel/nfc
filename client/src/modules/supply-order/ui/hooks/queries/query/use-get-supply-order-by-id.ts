import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetSupplyOrderById(id: Ref<string>) {
  const { supplyOrderPort } = useDependencies()

  return useQuery({
    queryKey: ['supplyOrders', id],
    queryFn: () => supplyOrderPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
