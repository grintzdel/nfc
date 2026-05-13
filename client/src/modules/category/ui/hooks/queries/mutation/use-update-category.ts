import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CategoryDomainModel } from '@/modules/category/core/model/category.domain-model'

export function useUpdateCategory() {
  const { categoryPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateCategory'],
    mutationFn: ({ id, dto }: { id: string; dto: CategoryDomainModel.UpdateCategoryDto }) =>
      categoryPort.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
