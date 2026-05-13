import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { OrderDomainModel } from '@/modules/order/core/model/order.domain-model'

export function useUpdateOrder() {
  const { orderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateOrder'],
    mutationFn: ({ id, dto }: { id: string; dto: OrderDomainModel.UpdateOrderDto }) => orderPort.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
