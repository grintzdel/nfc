import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCancelSupplyOrder() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['cancelSupplyOrder'],
    mutationFn: (id: string) => supplyOrderPort.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
