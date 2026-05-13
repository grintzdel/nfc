import { useQuery } from '@tanstack/vue-query'

import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetProducts() {
  const { productPort } = useDependencies()

  return useQuery({
    queryKey: ['products'],
    queryFn: () => productPort.getAll(),
  })
}
