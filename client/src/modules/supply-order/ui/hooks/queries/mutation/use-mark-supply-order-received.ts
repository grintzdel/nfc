import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useMarkSupplyOrderReceived() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['markSupplyOrderReceived'],
    mutationFn: (id: string) => supplyOrderPort.markReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
