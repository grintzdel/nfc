import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CategoryDomainModel } from '@/modules/category/core/model/category.domain-model'

export function useCreateCategory() {
  const { categoryPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createCategory'],
    mutationFn: (dto: CategoryDomainModel.CreateCategoryDto) => categoryPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
