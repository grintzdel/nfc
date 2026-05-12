import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { SupplyOrderDomainModel } from '@/modules/supply-order/core/model/supply-order.domain-model'

export function useCreateSupplyOrder() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createSupplyOrder'],
    mutationFn: (dto: SupplyOrderDomainModel.CreateSupplyOrderDto) => supplyOrderPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
    },
  })
}
