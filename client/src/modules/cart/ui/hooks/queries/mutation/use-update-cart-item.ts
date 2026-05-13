import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CartDomainModel } from '@/modules/cart/core/model/cart.domain-model'

export function useUpdateCartItem() {
  const { cartPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateCartItem'],
    mutationFn: ({ id, dto }: { id: string; dto: CartDomainModel.UpdateCartItemDto }) => cartPort.updateItem(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
