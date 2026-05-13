import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'

export function useAddToCart() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['addToCart'],
    mutationFn: (dto: CartDomainModel.AddToCartDto) => cartPort.addToCart(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
