import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ProductDomainModel } from '@/modules/product/core/model/product.domain-model'

export function useUpdateProduct() {
  const { productPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: ({ id, dto }: { id: string; dto: ProductDomainModel.UpdateProductDto }) =>
      productPort.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
