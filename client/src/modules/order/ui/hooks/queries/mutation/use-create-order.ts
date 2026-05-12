import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'

export function useCreateOrder() {
  const { orderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createOrder'],
    mutationFn: (dto: OrderDomainModel.CreateOrderDto) => orderPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
