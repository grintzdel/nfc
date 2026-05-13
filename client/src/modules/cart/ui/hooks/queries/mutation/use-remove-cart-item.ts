import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useRemoveCartItem() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['removeCartItem'],
    mutationFn: (id: string) => cartPort.removeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
