import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'

export function useCreateProduct() {
  const { productPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createProduct'],
    mutationFn: (dto: ProductDomainModel.CreateProductDto) => productPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
