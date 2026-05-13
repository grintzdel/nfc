import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteCategory() {
  const { categoryPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteCategory'],
    mutationFn: (id: string) => categoryPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
