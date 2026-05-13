import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetCategories() {
  const { categoryPort } = useDependencies()

  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryPort.getAll(),
  })
}
