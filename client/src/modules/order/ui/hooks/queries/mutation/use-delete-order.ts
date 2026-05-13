import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteOrder() {
  const { orderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteOrder'],
    mutationFn: (id: string) => orderPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
