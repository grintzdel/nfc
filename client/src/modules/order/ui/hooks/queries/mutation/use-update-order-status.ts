import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { OrderStatus } from '@/modules/order/core/model/order.domain-model'

export function useUpdateOrderStatus() {
  const { orderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateOrderStatus'],
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderPort.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
