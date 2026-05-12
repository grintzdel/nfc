import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useClearCart() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['clearCart'],
    mutationFn: () => cartPort.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
