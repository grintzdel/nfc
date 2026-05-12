import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteProduct() {
  const { productPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteProduct'],
    mutationFn: (id: string) => productPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
